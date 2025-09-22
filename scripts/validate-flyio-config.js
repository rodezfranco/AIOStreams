#!/usr/bin/env node

/**
 * AIOStreams - Fly.io Configuration Validator
 * Valida la sintaxis del archivo fly.toml
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const flyTomlPath = path.join(__dirname, '..', 'fly.toml');

console.log('🧪 Validando configuración de Fly.io...\n');

try {
    // Verificar que el archivo existe
    if (!fs.existsSync(flyTomlPath)) {
        throw new Error('❌ Archivo fly.toml no encontrado');
    }

    console.log('✅ Archivo fly.toml encontrado');

    // Leer el contenido del archivo
    const content = fs.readFileSync(flyTomlPath, 'utf8');

    // Verificaciones básicas de sintaxis TOML
    const validations = [
        {
            name: 'Nombre de la aplicación',
            test: () => content.includes('app ='),
            error: 'No se encontró la configuración de la aplicación'
        },
        {
            name: 'Configuración de build',
            test: () => content.includes('[build]'),
            error: 'No se encontró la sección [build]'
        },
        {
            name: 'Variables de entorno',
            test: () => content.includes('[env]'),
            error: 'No se encontró la sección [env]'
        },
        {
            name: 'Servicio HTTP',
            test: () => content.includes('[http_service]'),
            error: 'No se encontró la sección [http_service]'
        },
        {
            name: 'Health checks',
            test: () => content.includes('[[checks]]'),
            error: 'No se encontró la configuración de health checks'
        },
        {
            name: 'Configuración de VM',
            test: () => content.includes('[[vm]]'),
            error: 'No se encontró la configuración de VM'
        },
        {
            name: 'SECRET_KEY válida',
            test: () => {
                const secretKeyMatch = content.match(/SECRET_KEY = ['"]([^'"]*)['"]/);
                if (!secretKeyMatch) return false;
                const secretKey = secretKeyMatch[1];
                return secretKey.length === 64 && /^[0-9a-fA-F]+$/.test(secretKey);
            },
            error: 'SECRET_KEY no es válida (debe ser 64 caracteres hexadecimales)'
        },
        {
            name: 'Puerto interno válido',
            test: () => {
                const portMatch = content.match(/internal_port = (\d+)/);
                return portMatch && parseInt(portMatch[1]) > 0;
            },
            error: 'Puerto interno no es válido'
        }
    ];

    let allValid = true;

    validations.forEach(validation => {
        try {
            if (validation.test()) {
                console.log(`✅ ${validation.name}`);
            } else {
                console.log(`❌ ${validation.name}: ${validation.error}`);
                allValid = false;
            }
        } catch (error) {
            console.log(`❌ ${validation.name}: ${error.message}`);
            allValid = false;
        }
    });

    // Verificar sintaxis TOML usando flyctl si está disponible
    try {
        console.log('\n🔍 Verificando sintaxis TOML con flyctl...');
        execSync('fly version', { stdio: 'pipe' });
        execSync(`fly config validate --config ${flyTomlPath}`, { stdio: 'pipe' });
        console.log('✅ Sintaxis TOML validada por flyctl');
    } catch (error) {
        if (error.message.includes('fly')) {
            console.log('⚠️  flyctl no está disponible, omitiendo validación avanzada');
        } else {
            console.log(`❌ Error en validación TOML: ${error.message}`);
            allValid = false;
        }
    }

    console.log('\n' + '='.repeat(50));

    if (allValid) {
        console.log('🎉 ¡Configuración válida! Lista para desplegar.');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Configurar secrets: fly secrets set SECRET_KEY=...');
        console.log('2. Desplegar: fly launch');
        console.log('3. Ver logs: fly logs');
    } else {
        console.log('❌ La configuración tiene errores. Corrige los problemas antes de desplegar.');
        process.exit(1);
    }

} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}