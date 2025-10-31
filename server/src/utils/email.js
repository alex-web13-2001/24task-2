import nodemailer from 'nodemailer';

// Создание транспорта для отправки email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Отправка email подтверждения регистрации
 */
export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Подтверждение регистрации в 24Task',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добро пожаловать в 24Task, ${name}!</h2>
        <p>Спасибо за регистрацию. Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Подтвердить Email
          </a>
        </div>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Эта ссылка действительна в течение 72 часов.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Не удалось отправить письмо подтверждения');
  }
};

/**
 * Отправка email для восстановления пароля
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Восстановление пароля 24Task',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Восстановление пароля</h2>
        <p>Здравствуйте, ${name}!</p>
        <p>Вы запросили восстановление пароля. Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Восстановить пароль
          </a>
        </div>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Эта ссылка действительна в течение 1 часа. Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Не удалось отправить письмо для восстановления пароля');
  }
};

/**
 * Отправка приглашения в проект
 */
export const sendProjectInvitation = async (email, projectName, inviterName, token, role) => {
  const transporter = createTransporter();
  const invitationUrl = `${process.env.FRONTEND_URL}/invitation?token=${token}`;

  const roleNames = {
    'Collaborator': 'Соавтор',
    'Member': 'Участник',
    'Viewer': 'Наблюдатель'
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Приглашение в проект "${projectName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Приглашение в проект</h2>
        <p>${inviterName} приглашает вас присоединиться к проекту <strong>"${projectName}"</strong> в 24Task.</p>
        <p>Ваша роль: <strong>${roleNames[role]}</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Принять приглашение
          </a>
        </div>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Эта ссылка действительна в течение 72 часов.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Project invitation sent to ${email}`);
  } catch (error) {
    console.error('Error sending project invitation:', error);
    throw new Error('Не удалось отправить приглашение');
  }
};
