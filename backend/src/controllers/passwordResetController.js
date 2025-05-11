const User = require('../models/User');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Solicitação de redefinição de senha (versão simplificada)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    // Não revelar se o email existe ou não
    if (!user) {
      return res.status(200).json({ 
        message: 'Se o email estiver registrado, o código de recuperação será gerado.' 
      });
    }

    // Gerar token simples de 6 dígitos
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora
    
    // Atualizar usuário com token de redefinição
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // Em ambiente de produção, você esconderia esta parte
    // Mas para simplificar, vamos retornar o token diretamente
    res.status(200).json({ 
      message: 'Código de recuperação gerado com sucesso.',
      // REMOVA A LINHA ABAIXO EM PRODUÇÃO!
      resetToken: resetToken, // Apenas para facilitar o teste
      email: user.email
    });
  } catch (error) {
    console.error('Erro na solicitação de redefinição de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Redefinir a senha com o token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, email } = req.body;
    
    if (!token || !newPassword || !email) {
      return res.status(400).json({ message: 'Token, nova senha e email são obrigatórios' });
    }
    
    const user = await User.findOne({
      where: {
        email: email,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() } // Token ainda não expirou
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'O token de redefinição de senha é inválido ou expirou.' });
    }
    
    // Atualiza a senha do usuário
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();
    
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};