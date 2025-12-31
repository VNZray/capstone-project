/**
 * Webhook Event Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const WebhookEvent = sequelize.define('WebhookEvent', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    event_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'e.g., paymongo, stripe'
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('received', 'processing', 'processed', 'failed'),
      defaultValue: 'received'
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'webhook_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WebhookEvent;
};
