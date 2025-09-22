#!/usr/bin/env node

/**
 * AIOStreams - Fly.io TOML Syntax Fixer
 * Corrige automáticamente problemas comunes de sintaxis TOML
 */

const fs = require('fs');
const path = require('path');

const flyTomlPath = path.join(__dirname, '..', 'fly.toml');

console.log('🔧 Corrigiendo sintaxis TOML en fly.toml...\n');

try {
    // Verificar que el archivo existe
    if (!fs.existsSync(flyTomlPath)) {
        throw new Error('❌ Archivo fly.toml no encontrado');
    }

    // Leer el contenido del archivo
    let content = fs.readFileSync(flyTomlPath, 'utf8');

    console.log('✅ Archivo fly.toml encontrado');

    let fixes = 0;

    // Corregir valores booleanos con comillas innecesarias
    const booleanFixes = [
        { pattern: /DISABLE_RATE_LIMITS = ['"](\w+)['"]/, replacement: 'DISABLE_RATE_LIMITS = $1' },
        { pattern: /ENABLE_SEARCH_API = ['"](\w+)['"]/, replacement: 'ENABLE_SEARCH_API = $1' },
        { pattern: /EXPOSE_USER_COUNT = ['"](\w+)['"]/, replacement: 'EXPOSE_USER_COUNT = $1' },
        { pattern: /force_https = ['"](\w+)['"]/, replacement: 'force_https = $1' },
        { pattern: /auto_stop_machines = ['"](\w+)['"]/, replacement: 'auto_stop_machines = $1' },
        { pattern: /auto_start_machines = ['"](\w+)['"]/, replacement: 'auto_start_machines = $1' }
    ];

    booleanFixes.forEach(fix => {
        const oldContent = content;
        content = content.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
        if (oldContent !== content) {
            fixes++;
            console.log(`✅ Corregido: ${fix.pattern.source} → ${fix.replacement}`);
        }
    });

    // Corregir valores numéricos con comillas innecesarias
    const numberFixes = [
        { pattern: /DEFAULT_MAX_CACHE_SIZE = ['"](\d+)['"]/, replacement: 'DEFAULT_MAX_CACHE_SIZE = $1' },
        { pattern: /STREAM_CACHE_TTL = ['"](\d+)['"]/, replacement: 'STREAM_CACHE_TTL = $1' },
        { pattern: /CATALOG_CACHE_TTL = ['"](\d+)['"]/, replacement: 'CATALOG_CACHE_TTL = $1' },
        { pattern: /META_CACHE_TTL = ['"](\d+)['"]/, replacement: 'META_CACHE_TTL = $1' },
        { pattern: /DEFAULT_TIMEOUT = ['"](\d+)['"]/, replacement: 'DEFAULT_TIMEOUT = $1' },
        { pattern: /CATALOG_TIMEOUT = ['"](\d+)['"]/, replacement: 'CATALOG_TIMEOUT = $1' },
        { pattern: /META_TIMEOUT = ['"](\d+)['"]/, replacement: 'META_TIMEOUT = $1' },
        { pattern: /PORT = ['"](\d+)['"]/, replacement: 'PORT = $1' },
        { pattern: /internal_port = ['"](\d+)['"]/, replacement: 'internal_port = $1' },
        { pattern: /port = ['"](\d+)['"]/, replacement: 'port = $1' },
        { pattern: /cpus = ['"](\d+)['"]/, replacement: 'cpus = $1' },
        { pattern: /memory_mb = ['"](\d+)['"]/, replacement: 'memory_mb = $1' },
        { pattern: /min_machines_running = ['"](\d+)['"]/, replacement: 'min_machines_running = $1' }
    ];

    numberFixes.forEach(fix => {
        const oldContent = content;
        content = content.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
        if (oldContent !== content) {
            fixes++;
            console.log(`✅ Corregido: ${fix.pattern.source} → ${fix.replacement}`);
        }
    });

    // Corregir comillas simples por dobles en cadenas
    const stringFixes = [
        { pattern: /cpu_kind = '([^']*)'/, replacement: 'cpu_kind = "$1"' },
        {
            pattern: /processes = \[([^\]]*'[^']*'[^)]*)\]/, replacement: (match, p1) => {
                return `processes = ["${p1.replace(/'/g, '')}"]`;
            }
        }
    ];

    stringFixes.forEach(fix => {
        const oldContent = content;
        if (typeof fix.replacement === 'function') {
            content = content.replace(new RegExp(fix.pattern.source, 'g'), fix.replacement);
        } else {
            content = content.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
        }
        if (oldContent !== content) {
            fixes++;
            console.log(`✅ Corregido: ${fix.pattern.source} → ${fix.replacement}`);
        }
    });

    // Guardar los cambios si se hicieron correcciones
    if (fixes > 0) {
        fs.writeFileSync(flyTomlPath, content, 'utf8');
        console.log(`\n✅ ${fixes} correcciones aplicadas al archivo fly.toml`);
        console.log('✅ Archivo guardado exitosamente');
    } else {
        console.log('✅ No se encontraron problemas de sintaxis TOML');
    }

    // Validar la configuración corregida
    console.log('\n🧪 Validando configuración corregida...');
    const { execSync } = require('child_process');
    try {
        execSync('node scripts/validate-flyio-config.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('⚠️  La validación encontró algunos problemas. Revisa el archivo manualmente.');
    }

} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}