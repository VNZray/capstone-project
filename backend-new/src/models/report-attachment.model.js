/**
 * Report Attachment Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ReportAttachment = sequelize.define('ReportAttachment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    report_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'report_attachment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ReportAttachment.associate = (models) => {
    ReportAttachment.belongsTo(models.Report, {
      foreignKey: 'report_id',
      as: 'report'
    });
  };

  return ReportAttachment;
};
