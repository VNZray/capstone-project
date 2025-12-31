/**
 * Approval Record Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ApprovalRecord = sequelize.define('ApprovalRecord', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    entity_type: {
      type: DataTypes.ENUM('business', 'tourist_spot', 'event'),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('approve', 'reject', 'request_changes'),
      allowNull: false
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previous_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'approval_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ApprovalRecord.associate = (models) => {
    ApprovalRecord.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });
  };

  return ApprovalRecord;
};
