import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    return sendSuccess(res, { data: categories });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, { status: 404, message: 'Categoría no encontrada' });
    }
    return sendSuccess(res, { data: category });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

// Crear nueva categoría
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validar campos requeridos
    if (!name) {
      return sendError(res, { status: 400, message: 'El nombre de la categoría es requerido' });
    }

    // Verificar si ya existe
    const existing = await Category.findOne({ name });
    if (existing) {
      return sendError(res, { status: 400, message: 'Ya existe una categoría con este nombre' });
    }

    const category = new Category({
      name,
      description: description || '',
      image: image || null,
      active: true
    });

    await category.save();
    return sendSuccess(res, {
      status: 201,
      data: category,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image, active } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, { status: 404, message: 'Categoría no encontrada' });
    }

    // Verificar unicidad del nombre si cambia
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return sendError(res, { status: 400, message: 'Ya existe una categoría con este nombre' });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (active !== undefined) category.active = active;

    await category.save();
    return sendSuccess(res, {
      data: category,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

// Eliminar categoría
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return sendError(res, { status: 404, message: 'Categoría no encontrada' });
    }
    return sendSuccess(res, { message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};
