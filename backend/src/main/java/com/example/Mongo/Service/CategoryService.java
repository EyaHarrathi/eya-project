package com.example.Mongo.Service;

import com.example.Mongo.Entity.Category;
import com.example.Mongo.Repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(Category category) {
        // Créer une nouvelle instance avec seulement le nom
        Category newCategory = new Category();
        newCategory.setName(category.getName());
        return categoryRepository.save(newCategory);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
