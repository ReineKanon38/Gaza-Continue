#!/usr/bin/env python3
import urllib.request
import ssl
import time
import os

ssl._create_default_https_context = ssl._create_unverified_context

# URLs ÚNICAS para cada categoría - diferentes búsquedas en Unsplash
urls = {
    'audio-video.jpg': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    'automatizacion.jpg': 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
    'cableado.jpg': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    'control-acceso.jpg': 'https://images.unsplash.com/photo-1516534775068-bb57b6b0b399?w=800&h=600&fit=crop',
    'deteccion-fuego.jpg': 'https://images.unsplash.com/photo-1577091160550-2173dba999ef?w=800&h=600&fit=crop',
    'energia-herramientas.jpg': 'https://images.unsplash.com/photo-1581092162562-40038fbbb237?w=800&h=600&fit=crop',
    'iot-gps.jpg': 'https://images.unsplash.com/photo-1629876496043-46d9b2e1b5f1?w=800&h=600&fit=crop',
    'radiocomunicacion.jpg': 'https://images.unsplash.com/photo-1609619987988-e29059e033c1?w=800&h=600&fit=crop',
    'redes-it.jpg': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'robots-industrial.jpg': 'https://images.unsplash.com/photo-1551431009-381d36ac3a14?w=800&h=600&fit=crop',
    'videovigilancia.jpg': 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&h=600&fit=crop',
}

dest_path = r'c:\Users\Radic\OneDrive\Escritorio\SS\GAZA(SYSCOM)\SISTEMA-GAZA\frontend\public\category-images'

print("🔄 Descargando imágenes de categorías...\n")
print("=" * 70)

success = 0
fail = 0

for i, (filename, url) in enumerate(urls.items(), 1):
    try:
        filepath = os.path.join(dest_path, filename)
        print(f"[{i:2d}/11] {filename:30s} ", end='', flush=True)
        
        urllib.request.urlretrieve(url, filepath)
        
        size = os.path.getsize(filepath)
        print(f"✓ ({size:,} bytes)")
        success += 1
        
    except Exception as e:
        print(f"✗ Error: {str(e)[:40]}")
        fail += 1
    
    time.sleep(0.3)

print("=" * 70)
print(f"\n✓ Exitosas: {success} | ✗ Fallidas: {fail}")
print(f"Directorio: {dest_path}\n")

# Mostrar lista de archivos
print("Archivos descargados:")
for f in sorted(os.listdir(dest_path)):
    if f.endswith('.jpg'):
        full_path = os.path.join(dest_path, f)
        size = os.path.getsize(full_path)
        print(f"  ✓ {f} - {size:,} bytes")
