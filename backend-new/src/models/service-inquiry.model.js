/**
 * Service Inquiry Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ServiceInquiry = sequelize.define('ServiceInquiry', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    preferred_contact: {
      type: DataTypes.ENUM('email', 'phone', 'sms'),
      defaultValue: 'email'
    },
    status: {
      type: DataTypes.ENUM('pending', 'contacted', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'service_inquiry',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ServiceInquiry.associate = (models) => {
    ServiceInquiry.belongsTo(models.Service, {
      foreignKey: 'service_id',
      as: 'service'
    });
    ServiceInquiry.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ServiceInquiry;
};
