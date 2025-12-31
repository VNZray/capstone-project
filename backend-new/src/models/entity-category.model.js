/**
 * EntityCategory Model
 * Junction table linking entities (business, tourist_spot, event) to categories
 */
export default (sequelize, DataTypes) => {
  const EntityCategory = sequelize.define('EntityCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    entity_type: {
      type: DataTypes.ENUM('business', 'tourist_spot', 'event'),
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Priority: 1=primary, 2=secondary, 3=tertiary',
      validate: {
        min: 1,
        max: 3
      }
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'entity_categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['entity_id', 'entity_type'] },
      { fields: ['category_id'] },
      { fields: ['is_primary'] },
      {
        fields: ['entity_id', 'entity_type', 'category_id'],
        unique: true,
        name: 'entity_category_unique'
      }
    ]
  });

  EntityCategory.associate = (models) => {
    EntityCategory.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  // Class method to get categories for an entity
  EntityCategory.getCategoriesForEntity = async function(entityId, entityType) {
    return EntityCategory.findAll({
      where: { entity_id: entityId, entity_type: entityType },
      include: [{
        model: sequelize.models.Category,
        as: 'category'
      }],
      order: [['level', 'ASC']]
    });
  };

  // Class method to set categories for an entity
  EntityCategory.setCategoriesForEntity = async function(entityId, entityType, categoryIds, primaryCategoryId = null) {
    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Remove existing categories
      await EntityCategory.destroy({
        where: { entity_id: entityId, entity_type: entityType },
        transaction
      });

      // Add new categories
      const newCategories = categoryIds.map((catId, index) => ({
        entity_id: entityId,
        entity_type: entityType,
        category_id: catId,
        level: index + 1,
        is_primary: catId === primaryCategoryId || (index === 0 && !primaryCategoryId)
      }));

      await EntityCategory.bulkCreate(newCategories, { transaction });
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return EntityCategory;
};
