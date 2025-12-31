/**
 * Category Model
 * Hierarchical categories for businesses, tourist spots, and events
 */
export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parent_category: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    alias: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Alias is required' }
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applicable_to: {
      type: DataTypes.ENUM('business', 'tourist_spot', 'event', 'business,tourist_spot', 'business,event', 'tourist_spot,event', 'all'),
      allowNull: false,
      defaultValue: 'all'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['parent_category'] },
      { fields: ['status'] },
      { fields: ['applicable_to'] },
      { fields: ['alias'], unique: true }
    ]
  });

  Category.associate = (models) => {
    // Self-referencing relationship for parent-child
    Category.belongsTo(models.Category, {
      foreignKey: 'parent_category',
      as: 'parent'
    });

    Category.hasMany(models.Category, {
      foreignKey: 'parent_category',
      as: 'children'
    });

    // Relationship with entity categories
    Category.hasMany(models.EntityCategory, {
      foreignKey: 'category_id',
      as: 'entityCategories'
    });
  };

  // Instance method to get tree depth
  Category.prototype.getDepth = async function() {
    let depth = 1;
    let currentCategory = this;

    while (currentCategory.parent_category) {
      depth++;
      currentCategory = await Category.findByPk(currentCategory.parent_category);
      if (!currentCategory) break;
    }

    return depth;
  };

  // Class method to get full tree
  Category.getTree = async function(applicableTo = null) {
    const where = { status: 'active' };
    if (applicableTo) {
      where[sequelize.Op.or] = [
        { applicable_to: applicableTo },
        { applicable_to: 'all' },
        sequelize.where(
          sequelize.fn('FIND_IN_SET', applicableTo, sequelize.col('applicable_to')),
          { [sequelize.Op.gt]: 0 }
        )
      ];
    }

    return Category.findAll({
      where,
      order: [['sort_order', 'ASC'], ['title', 'ASC']],
      include: [{
        model: Category,
        as: 'children',
        required: false
      }]
    });
  };

  return Category;
};
