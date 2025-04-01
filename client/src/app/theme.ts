'use client';
import { Archivo, Archivo_Black } from 'next/font/google';
import { createTheme, ThemeOptions } from '@mui/material/styles';

const archivoBlack = Archivo_Black({
    weight: ["400"],
    style: ["normal"],
    subsets: ["latin"],
})

const archivo = Archivo({
    style: ["normal"],
    subsets: ["latin"],
})

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4525a5',
    },
    secondary: {
      main: '#a677ca',
    },
  },
  typography: {
    fontFamily: archivo.style.fontFamily,
    fontWeight: 400,
    h1: {
        fontFamily: archivoBlack.style.fontFamily,
        fontWeight: 1000,
        fontSize: 150,
        lineHeight: 0.75,
    },
    h2: {
        fontFamily: archivoBlack.style.fontFamily,
        fontWeight: 800,
    },
    h3: {
        fontFamily: archivoBlack.style.fontFamily,
        fontWeight: 600,
    },
    button: {
        fontFamily: archivo.style.fontFamily,
        fontWeight: 800,
    },
    h4: {
        fontFamily: archivo.style.fontFamily,
        fontWeight: 10000,
    },
    h5: {
        fontFamily: archivo.style.fontFamily,
        fontWeight: 800,
    },
  },
};

export const mainTheme = createTheme(themeOptions);