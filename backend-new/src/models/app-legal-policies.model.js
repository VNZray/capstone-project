/**
 * AppLegalPolicies Model
 * Stores platform-wide Terms & Conditions and Privacy Policy
 */
export default (sequelize, DataTypes) => {
  const AppLegalPolicies = sequelize.define('AppLegalPolicies', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    terms_and_conditions: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    privacy_policy: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'app_legal_policies',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['is_active'] },
      { fields: ['version'] }
    ]
  });

  // Class method to get active policies
  AppLegalPolicies.getActive = async function() {
    return AppLegalPolicies.findOne({
      where: { is_active: true },
      order: [['version', 'DESC']]
    });
  };

  // Class method to update policies and increment version
  AppLegalPolicies.updatePolicies = async function(updates, userId = null) {
    const currentActive = await AppLegalPolicies.getActive();

    if (currentActive) {
      // Deactivate current version
      await currentActive.update({ is_active: false });
    }

    // Create new version
    const newVersion = currentActive ? currentActive.version + 1 : 1;

    return AppLegalPolicies.create({
      terms_and_conditions: updates.terms_and_conditions || (currentActive?.terms_and_conditions || null),
      privacy_policy: updates.privacy_policy || (currentActive?.privacy_policy || null),
      version: newVersion,
      is_active: true,
      updated_by: userId
    });
  };

  return AppLegalPolicies;
};
