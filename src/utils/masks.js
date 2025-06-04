// masks.js - versão simplificada inicial
export const maskCpf = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, ''); // Remove tudo que não é dígito
};

export const maskCep = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, ''); // Remove tudo que não é dígito
};

export const maskPhone = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, ''); // Remove tudo que não é dígito
};