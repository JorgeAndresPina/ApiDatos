const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("data.json"); // Base de datos
const middlewares = jsonServer.defaults();
const nodemailer = require('nodemailer'); // Para enviar el correo

const port = process.env.PORT || 10000;

server.use(middlewares);

// Configura el transporte de nodemailer (puedes usar otro servicio de correo)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // O el servicio de correo que prefieras
  auth: {
    user: 'tu-correo@gmail.com', // Reemplaza con tu correo
    pass: 'tu-contraseña' // Reemplaza con tu contraseña (o usa un token de aplicación)
  }
});

// Ruta para solicitar la recuperación de contraseña
server.post('/recucontraseña', (req, res) => {
  const { email } = req.body;

  // Buscar el usuario en la base de datos
  const db = router.db; // Acceso a la base de datos
  const user = db.get('users').find({ email }).value();

  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  // Generar un token de recuperación (simple token con la fecha actual)
  const token = Date.now().toString(36);

  // Establecer un tiempo de expiración (1 hora)
  const expiration = Date.now() + 3600000;

  // Guardar el token y la expiración en el usuario
  db.get('users').find({ email }).assign({ resetPasswordToken: token, resetPasswordExpires: expiration }).write();

  // Crear el correo para enviar al usuario
  const mailOptions = {
    from: 'tu-correo@gmail.com', // Reemplaza con tu correo
    to: email,
    subject: 'Recuperación de Contraseña',
    text: `Haz clic en el siguiente enlace para restablecer tu contraseña: https://apidatos-6os7.onrender.com/restablecer-contraseña?token=${token}`
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
    res.status(200).json({ message: 'Correo enviado correctamente', info });
  });
});

// Usar el enrutador de JSON Server
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server está corriendo en http://localhost:${port}`);
});
