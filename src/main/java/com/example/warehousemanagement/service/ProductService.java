package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.*;
import com.example.warehousemanagement.entity.Inventory;
import com.example.warehousemanagement.entity.Product;
import com.example.warehousemanagement.entity.StorageLocation;
import com.example.warehousemanagement.entity.StockMovement;
import com.example.warehousemanagement.entity.enums.InventoryStatus;
import com.example.warehousemanagement.exception.NotFoundException;
import com.example.warehousemanagement.mapper.ProductMapper;
import com.example.warehousemanagement.repository.CategoryRepository;
import com.example.warehousemanagement.repository.InventoryRepository;
import com.example.warehousemanagement.repository.ProductRepository;
import com.example.warehousemanagement.repository.StockMovementRepository;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProductService {

    public static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Autowired
    public ProductService(
            ProductRepository productRepository,
            ProductMapper productMapper,
            CategoryRepository categoryRepository,
            InventoryRepository inventoryRepository,
            StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = productMapper.productDTOToProduct(dto);
        applyCategory(product, dto.getCategoryId());
        Product savedProduct = productRepository.save(product);
        return productMapper.productToProductDTO(savedProduct);
    }

    @Transactional
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::productToProductDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::productToProductDTO)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductStatsDTO getProductStats() {
        long totalSku = productRepository.count();
        List<Product> all = productRepository.findAll();
        double avgPrice = all.isEmpty() ? 0.0
                : all.stream().mapToDouble(p -> p.getPrice() != null ? p.getPrice() : 0.0).average().orElse(0.0);

        Map<Long, Integer> stockMap = buildStockMap(
                all.stream().map(Product::getId).collect(Collectors.toList()));

        double totalValue = 0.0;
        long lowStock = 0;
        for (Product p : all) {
            int avail = stockMap.getOrDefault(p.getId(), 0);
            double price = p.getPrice() != null ? p.getPrice() : 0.0;
            totalValue += price * avail;
            int thr = effectiveThreshold(p.getLowStockThreshold());
            if (avail > 0 && avail <= thr) {
                lowStock++;
            }
        }

        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recent = productRepository.countByUpdatedAtAfter(weekAgo);

        return new ProductStatsDTO(totalSku, avgPrice, totalValue, lowStock, recent);
    }

    /**
     * Catalog table with optional filters. Stock filter is applied in memory (suitable for moderate catalogs).
     */
    @Transactional
    public ProductCatalogPageDTO getProductCatalog(
            int page,
            int size,
            String search,
            Long warehouseId,
            Long categoryId,
            String stockStatus,
            LocalDate updatedFrom,
            LocalDate updatedTo) {
        Specification<Product> spec = Specification.where(null);
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }
        if (updatedFrom != null) {
            LocalDateTime from = updatedFrom.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("updatedAt"), from));
        }
        if (updatedTo != null) {
            LocalDateTime end = LocalDateTime.of(updatedTo, LocalTime.of(23, 59, 59, 999_999_999));
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("updatedAt"), end));
        }
        if (warehouseId != null) {
            spec = spec.and((root, query, cb) -> {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<Inventory> inv = sub.from(Inventory.class);
                sub.select(inv.get("product").get("id"));
                sub.where(cb.equal(inv.get("warehouse").get("id"), warehouseId));
                return root.get("id").in(sub);
            });
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }

        List<Product> ordered = productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Map<Long, Integer> stockMap = buildStockMap(
                ordered.stream().map(Product::getId).collect(Collectors.toList()));

        List<Product> filtered = ordered.stream()
                .filter(p -> stockStatus == null || stockStatus.isBlank()
                        || "ALL".equalsIgnoreCase(stockStatus)
                        || matchesStockLabel(stockMap.getOrDefault(p.getId(), 0), p.getLowStockThreshold(), stockStatus))
                .collect(Collectors.toList());

        int total = filtered.size();
        int from = Math.max(0, page * size);
        int to = Math.min(from + size, total);
        List<Product> slice = from < total ? filtered.subList(from, to) : List.of();

        List<ProductCatalogRowDTO> rows = new ArrayList<>();
        for (Product p : slice) {
            int avail = stockMap.getOrDefault(p.getId(), 0);
            rows.add(new ProductCatalogRowDTO(
                    p.getId(),
                    p.getName(),
                    p.getSku(),
                    p.getPrice(),
                    p.getDescription(),
                    p.getCategory() != null ? p.getCategory().getId() : null,
                    p.getCategory() != null ? p.getCategory().getName() : null,
                    avail,
                    stockLabel(avail, p.getLowStockThreshold()),
                    p.getLowStockThreshold(),
                    p.getCreatedBy(),
                    p.getUpdatedBy(),
                    p.getCreatedAt(),
                    p.getUpdatedAt(),
                    p.getBarcode() != null ? p.getBarcode().getId() : null,
                    p.getQrCode() != null ? p.getQrCode().getId() : null,
                    resolvePrimaryLocationLabel(p.getId())
            ));
        }

        int totalPages = size <= 0 ? 0 : (int) Math.ceil(total / (double) size);
        ProductCatalogPageDTO out = new ProductCatalogPageDTO();
        out.setContent(rows);
        out.setTotalElements(total);
        out.setTotalPages(totalPages);
        out.setNumber(page);
        out.setSize(size);
        return out;
    }

    @Transactional
    public ProductDetailDTO getProductDetail(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
        Map<Long, Integer> stockMap = buildStockMap(List.of(id));
        int totalAvail = stockMap.getOrDefault(id, 0);

        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSku(p.getSku());
        dto.setPrice(p.getPrice());
        dto.setDescription(p.getDescription());
        dto.setCategoryId(p.getCategory() != null ? p.getCategory().getId() : null);
        dto.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : null);
        dto.setManufacturer(p.getManufacturer());
        dto.setDimensionsText(p.getDimensionsText());
        dto.setWeightKg(p.getWeightKg());
        dto.setMaterial(p.getMaterial());
        dto.setOperatingTempRange(p.getOperatingTempRange());
        dto.setIpRating(p.getIpRating());
        dto.setImageUrl(p.getImageUrl());
        dto.setLowStockThreshold(p.getLowStockThreshold());
        dto.setCreatedBy(p.getCreatedBy());
        dto.setUpdatedBy(p.getUpdatedBy());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        dto.setBarcodeId(p.getBarcode() != null ? p.getBarcode().getId() : null);
        dto.setBarcodeCode(p.getBarcode() != null ? p.getBarcode().getCode() : null);
        dto.setQrCodeId(p.getQrCode() != null ? p.getQrCode().getId() : null);
        dto.setQrCodeValue(p.getQrCode() != null ? p.getQrCode().getCode() : null);
        dto.setTotalAvailableUnits(totalAvail);
        dto.setStockStatus(stockLabel(totalAvail, p.getLowStockThreshold()));

        dto.setStockDistribution(buildDistribution(p.getId(), p.getLowStockThreshold()));
        dto.setMovementHistory(buildMovementHistory(p.getId()));
        return dto;
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(productDTO.getName());
            existing.setSku(productDTO.getSku());
            existing.setPrice(productDTO.getPrice());
            existing.setDescription(productDTO.getDescription());
            existing.setUpdatedBy(productDTO.getUpdatedBy());
            existing.setManufacturer(productDTO.getManufacturer());
            existing.setDimensionsText(productDTO.getDimensionsText());
            existing.setWeightKg(productDTO.getWeightKg());
            existing.setMaterial(productDTO.getMaterial());
            existing.setOperatingTempRange(productDTO.getOperatingTempRange());
            existing.setIpRating(productDTO.getIpRating());
            existing.setImageUrl(productDTO.getImageUrl());
            existing.setLowStockThreshold(productDTO.getLowStockThreshold());
            applyCategory(existing, productDTO.getCategoryId());
            Product updated = productRepository.save(existing);
            return productMapper.productToProductDTO(updated);
        }).orElseThrow(() -> new NotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private void applyCategory(Product product, Long categoryId) {
        if (categoryId != null) {
            product.setCategory(
                    categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId)));
        } else {
            product.setCategory(null);
        }
    }

    private Map<Long, Integer> buildStockMap(List<Long> productIds) {
        if (productIds.isEmpty()) {
            return Map.of();
        }
        List<Object[]> rows = inventoryRepository.sumAvailableUnitsGroupedByProduct(
                productIds, InventoryStatus.AVAILABLE);
        Map<Long, Integer> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put((Long) r[0], ((Number) r[1]).intValue());
        }
        return map;
    }

    private static int effectiveThreshold(Integer lowStockThreshold) {
        return lowStockThreshold != null && lowStockThreshold > 0 ? lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD;
    }

    private static String stockLabel(int availableUnits, Integer lowStockThreshold) {
        if (availableUnits <= 0) {
            return "OUT_OF_STOCK";
        }
        int thr = effectiveThreshold(lowStockThreshold);
        if (availableUnits <= thr) {
            return "LOW_STOCK";
        }
        return "IN_STOCK";
    }

    private static boolean matchesStockLabel(int availableUnits, Integer lowStockThreshold, String filter) {
        String label = stockLabel(availableUnits, lowStockThreshold);
        return switch (filter.trim().toUpperCase(Locale.ROOT)) {
            case "IN_STOCK" -> "IN_STOCK".equals(label);
            case "LOW_STOCK" -> "LOW_STOCK".equals(label);
            case "OUT_OF_STOCK" -> "OUT_OF_STOCK".equals(label);
            default -> true;
        };
    }

    private String resolvePrimaryLocationLabel(Long productId) {
        List<Inventory> lines = inventoryRepository.findByProduct_Id(productId);
        Optional<Inventory> best = lines.stream()
                .filter(i -> i.getStorageLocation() != null && availableUnits(i) > 0)
                .max(Comparator.comparingInt(this::availableUnits));
        return best.map(i -> formatLocationBfs(i.getStorageLocation())).orElse(null);
    }

    private int availableUnits(Inventory i) {
        int q = i.getQuantity();
        int a = i.getQuantityAllocated() != null ? i.getQuantityAllocated() : 0;
        return Math.max(0, q - a);
    }

    private static String formatLocationBfs(StorageLocation sl) {
        if (sl == null) {
            return null;
        }
        String s = Stream.of(sl.getBuilding(), sl.getFloor(), sl.getSection())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(x -> !x.isEmpty())
                .collect(Collectors.joining(" / "));
        return s.isEmpty() ? null : s;
    }

    private List<ProductStockDistributionDTO> buildDistribution(Long productId, Integer lowThreshold) {
        List<Inventory> lines = inventoryRepository.findByProduct_Id(productId);
        Map<String, List<Inventory>> grouped = new LinkedHashMap<>();
        for (Inventory inv : lines) {
            if (inv.getWarehouse() == null) {
                continue;
            }
            Long locId = inv.getStorageLocation() != null ? inv.getStorageLocation().getId() : -1L;
            String key = inv.getWarehouse().getId() + "_" + locId;
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(inv);
        }
        List<ProductStockDistributionDTO> out = new ArrayList<>();
        for (List<Inventory> group : grouped.values()) {
            Inventory first = group.get(0);
            int sumAvail = group.stream().mapToInt(this::availableUnits).sum();
            int totalPhysical = group.stream().mapToInt(Inventory::getQuantity).sum();
            if (totalPhysical <= 0) {
                continue;
            }
            StorageLocation sl = first.getStorageLocation();
            String bfs = formatLocationBfs(sl);
            String rowStatus = stockLabel(sumAvail, lowThreshold);
            out.add(new ProductStockDistributionDTO(
                    first.getWarehouse().getId(),
                    first.getWarehouse().getName(),
                    bfs != null ? bfs : "—",
                    sumAvail,
                    rowStatus
            ));
        }
        out.sort(Comparator.comparing(ProductStockDistributionDTO::getFacilityName));
        return out;
    }

    private List<ProductMovementHistoryDTO> buildMovementHistory(Long productId) {
        List<StockMovement> moves = stockMovementRepository.findByProduct_IdOrderByMovementDateDesc(
                productId, PageRequest.of(0, 40));
        List<ProductMovementHistoryDTO> out = new ArrayList<>();
        for (StockMovement m : moves) {
            LocalDateTime dt = m.getMovementDate() != null ? m.getMovementDate() : LocalDateTime.now();
            out.add(new ProductMovementHistoryDTO(
                    m.getId(),
                    m.getMovementType() != null ? m.getMovementType().name() : "",
                    m.getReason(),
                    m.getQuantityChange(),
                    dt,
                    m.getWarehouse() != null ? m.getWarehouse().getName() : "—",
                    m.getCreatedBy()
            ));
        }
        return out;
    }
}
