const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pristine';
    console.log(`[Pristine DB] Conectando a MongoDB en: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('[Pristine DB] Conexión exitosa a MongoDB');
  } catch (err) {
    console.error('[Pristine DB] Error conectando a MongoDB:', err.message);
    console.warn('[Pristine DB] Asegúrate de que MongoDB esté corriendo localmente o que la URI en .env apunte a tu servidor de AWS.');
  }
};

module.exports = connectDB;
