package com.example.Mongo.Entity;


import java.time.LocalDate;

public class RentalPeriod {
    private String rentalStatus; // "disponible", "indisponible"
    private LocalDate rentalStartDate;
    private LocalDate rentalEndDate;

    public RentalPeriod() {
    }

    public RentalPeriod(String rentalStatus, LocalDate rentalStartDate, LocalDate rentalEndDate) {
        this.rentalStatus = rentalStatus;
        this.rentalStartDate = rentalStartDate;
        this.rentalEndDate = rentalEndDate;
    }

    public String getRentalStatus() {
        return rentalStatus;
    }

    public void setRentalStatus(String rentalStatus) {
        this.rentalStatus = rentalStatus;
    }

    public LocalDate getRentalStartDate() {
        return rentalStartDate;
    }

    public void setRentalStartDate(LocalDate rentalStartDate) {
        this.rentalStartDate = rentalStartDate;
    }

    public LocalDate getRentalEndDate() {
        return rentalEndDate;
    }

    public void setRentalEndDate(LocalDate rentalEndDate) {
        this.rentalEndDate = rentalEndDate;
    }
}
