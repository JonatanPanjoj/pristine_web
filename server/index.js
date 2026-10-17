const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./db');
const apiRoutes = require('./routes/api');
const { startChecklistScheduler } = require('./jobs/checklistScheduler');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Rutas API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Pristine Web API',
    time: new Date().toISOString()
  });
});

// Iniciar base de datos y servidor
const startServer = async () => {
  await connectDB();
  
  // Iniciar tareas programadas (alertas 10 minutos antes de cierre de checklist)
  startChecklistScheduler();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Pristine API Server activo en el puerto ${PORT}`);
    console.log(`  http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
};

startServer();
