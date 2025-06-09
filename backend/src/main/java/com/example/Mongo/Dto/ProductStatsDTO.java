package com.example.Mongo.Dto;

import java.util.List;

public class ProductStatsDTO {
    private long totalProducts;
    private List<CategoryDistribution> categoryDistribution;
    private List<MonthlySales> monthlySales;
    private List<TypeDistribution> typeDistribution;
    private long activeProducts;
    private long inactiveProducts;
    private long lowStockProducts;

    // Constructors
    public ProductStatsDTO() {}

    public ProductStatsDTO(long totalProducts, List<CategoryDistribution> categoryDistribution,
                           List<MonthlySales> monthlySales, List<TypeDistribution> typeDistribution,
                           long activeProducts, long inactiveProducts, long lowStockProducts) {
        this.totalProducts = totalProducts;
        this.categoryDistribution = categoryDistribution;
        this.monthlySales = monthlySales;
        this.typeDistribution = typeDistribution;
        this.activeProducts = activeProducts;
        this.inactiveProducts = inactiveProducts;
        this.lowStockProducts = lowStockProducts;
    }

    // Getters and setters
    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public List<CategoryDistribution> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<CategoryDistribution> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<MonthlySales> getMonthlySales() { return monthlySales; }
    public void setMonthlySales(List<MonthlySales> monthlySales) { this.monthlySales = monthlySales; }

    public List<TypeDistribution> getTypeDistribution() { return typeDistribution; }
    public void setTypeDistribution(List<TypeDistribution> typeDistribution) { this.typeDistribution = typeDistribution; }

    public long getActiveProducts() { return activeProducts; }
    public void setActiveProducts(long activeProducts) { this.activeProducts = activeProducts; }

    public long getInactiveProducts() { return inactiveProducts; }
    public void setInactiveProducts(long inactiveProducts) { this.inactiveProducts = inactiveProducts; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    // ✅ Inner static DTO classes

    public static class CategoryDistribution {
        private String categoryId;
        private long count;

        public String getCategoryId() { return categoryId; }
        public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class TypeDistribution {
        private String type;
        private long count;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class MonthlySales {
        private String month;
        private double totalSales;

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public double getTotalSales() { return totalSales; }
        public void setTotalSales(double totalSales) { this.totalSales = totalSales; }
    }
}
