import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[VitePWA({registerType:'autoUpdate',
manifest:{name:'Carry-On Teacher Materials',short_name:'Carry-On',display:'standalone',start_url:'/',background_color:'#1f3a34',theme_color:'#1f3a34',
icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},
workbox:{globPatterns:['**/*.{js,css,html,svg,png}'],runtimeCaching:[{urlPattern:/^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,handler:'CacheFirst',options:{cacheName:'fonts'}}]}})]});
