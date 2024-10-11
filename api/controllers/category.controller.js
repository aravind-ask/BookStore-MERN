import express from "express";
import { errorHandler } from "../utils/error.js";
import Category from "../models/category.model.js";

export const addCategory = async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return next(errorHandler(400, "All fields are required"));
  }
  if (!name.trim()) {
    return next(errorHandler(400, "Category name cannot be empty"));
  }
  console.log(req.body);
  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true }
    );
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(errorHandler(404, "Category not found"));
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};