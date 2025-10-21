import mongoose from "mongoose";

// Create two separate connections
let primaryConnection = null;  // MongoDB Atlas
let secondaryConnection = null; // Localhost

// Initialize dual database connections
export const initializeDualConnections = async () => {
    try {
        // Connect to primary (MongoDB Atlas)
        primaryConnection = await mongoose.connect(process.env.MONGO);
        console.log("✅ Connected to PRIMARY MongoDB (Atlas)");

        // Connect to secondary (Localhost) if dual write is enabled
        if (process.env.DUAL_WRITE === 'true' && process.env.MONGO_LOCAL) {
            try {
                secondaryConnection = await mongoose.createConnection(process.env.MONGO_LOCAL);
                console.log("✅ Connected to SECONDARY MongoDB (Localhost)");
            } catch (error) {
                console.warn("⚠️ Could not connect to secondary database (localhost):", error.message);
                console.warn("   Continuing with primary database only...");
            }
        }

        return { primary: primaryConnection, secondary: secondaryConnection };
    } catch (error) {
        console.error("❌ Failed to connect to PRIMARY database:", error);
        throw error;
    }
};

// Helper to write to both databases
export const dualWrite = async (modelName, operation, data) => {
    const results = { primary: null, secondary: null, errors: [] };

    try {
        // Always write to primary
        const PrimaryModel = mongoose.model(modelName);
        results.primary = await operation(PrimaryModel, data);
    } catch (error) {
        results.errors.push({ db: 'primary', error: error.message });
        throw error; // Throw error if primary write fails
    }

    // Write to secondary if enabled and connected
    if (process.env.DUAL_WRITE === 'true' && secondaryConnection) {
        try {
            const SecondaryModel = secondaryConnection.model(modelName);
            results.secondary = await operation(SecondaryModel, data);
        } catch (error) {
            results.errors.push({ db: 'secondary', error: error.message });
            console.warn(`⚠️ Secondary database write failed for ${modelName}:`, error.message);
            // Don't throw - secondary write failure is not critical
        }
    }

    return results;
};

// Helper function for create operations
export const dualCreate = async (modelName, data) => {
    return dualWrite(modelName, async (Model, data) => {
        return await Model.create(data);
    }, data);
};

// Helper function for update operations
export const dualUpdate = async (modelName, query, updateData) => {
    const results = { primary: null, secondary: null, errors: [] };

    try {
        const PrimaryModel = mongoose.model(modelName);
        results.primary = await PrimaryModel.findOneAndUpdate(query, updateData, { new: true });
    } catch (error) {
        results.errors.push({ db: 'primary', error: error.message });
        throw error;
    }

    if (process.env.DUAL_WRITE === 'true' && secondaryConnection) {
        try {
            const SecondaryModel = secondaryConnection.model(modelName);
            results.secondary = await SecondaryModel.findOneAndUpdate(query, updateData, { new: true });
        } catch (error) {
            results.errors.push({ db: 'secondary', error: error.message });
            console.warn(`⚠️ Secondary database update failed for ${modelName}:`, error.message);
        }
    }

    return results;
};

// Helper function for delete operations
export const dualDelete = async (modelName, query) => {
    const results = { primary: null, secondary: null, errors: [] };

    try {
        const PrimaryModel = mongoose.model(modelName);
        results.primary = await PrimaryModel.findOneAndDelete(query);
    } catch (error) {
        results.errors.push({ db: 'primary', error: error.message });
        throw error;
    }

    if (process.env.DUAL_WRITE === 'true' && secondaryConnection) {
        try {
            const SecondaryModel = secondaryConnection.model(modelName);
            results.secondary = await SecondaryModel.findOneAndDelete(query);
        } catch (error) {
            results.errors.push({ db: 'secondary', error: error.message });
            console.warn(`⚠️ Secondary database delete failed for ${modelName}:`, error.message);
        }
    }

    return results;
};

export const getConnections = () => ({
    primary: primaryConnection,
    secondary: secondaryConnection
});
