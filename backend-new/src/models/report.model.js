/**
 * Report Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    target_type: {
      type: DataTypes.ENUM('business', 'event', 'tourist_spot', 'accommodation'),
      allowNull: false
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected'),
      defaultValue: 'submitted'
    }
  }, {
    tableName: 'report',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: 'reporter_id',
      as: 'reporter'
    });
    Report.hasMany(models.ReportAttachment, {
      foreignKey: 'report_id',
      as: 'attachments'
    });
  };

  return Report;
};
