# ✅ CHECKLIST DE PRUEBAS - SuperAhorro

## 🔌 CONEXIÓN
- [ ] Wallet Freighter se conecta
- [ ] Muestra address correctamente
- [ ] Muestra balance de XLM

## 🏦 CREAR VAULT
- [ ] Formulario acepta cantidad válida (>0)
- [ ] Seleccionar duración entre 7-365 días
- [ ] Freighter popup aparece para firmar
- [ ] Transacción se confirma en blockchain
- [ ] XLM se descuenta del balance
- [ ] Toast "Vault created successfully" aparece
- [ ] Formulario se limpia después de crear

## 📋 VER VAULTS
- [ ] Botón "Refresh" funciona
- [ ] Se muestran solo mis vaults
- [ ] Cantidad en XLM correcta
- [ ] Fecha de unlock correcta
- [ ] Badge "Locked" cuando está bloqueado
- [ ] Badge "Unlocked" cuando ya pasó el tiempo
- [ ] Countdown timer actualiza en tiempo real

## 💰 WITHDRAWAL NORMAL
- [ ] Botón "Withdraw" deshabilitado cuando locked
- [ ] Botón "Withdraw" habilitado cuando unlocked
- [ ] Freighter popup para firmar
- [ ] XLM regresa completo al wallet
- [ ] Vault se marca como inactive
- [ ] Toast de éxito aparece

## ⚡ EARLY WITHDRAWAL
- [ ] Botón "Early Withdraw" visible cuando locked
- [ ] Se aplica penalización fija del 7%
- [ ] Usuario recibe 93% del monto
- [ ] Admin recibe 7% como penalización
- [ ] Vault se marca como inactive
- [ ] Toast muestra monto y penalización

## 🔄 ACTUALIZACIÓN
- [ ] Después de withdrawal, hacer refresh muestra vault inactivo
- [ ] Contador de vaults aumenta correctamente
- [ ] No se pueden hacer operaciones en vault inactivo

## ❌ VALIDACIONES
- [ ] No se puede crear vault con 0 XLM
- [ ] No se puede crear vault con duración < 7 días
- [ ] No se puede crear vault con duración > 365 días
- [ ] No se puede withdraw dos veces el mismo vault
- [ ] Mensajes de error claros en cada caso

## 🧪 CASOS EDGE
- [ ] Crear vault con cantidad muy grande (1000+ XLM)
- [ ] Crear vault con duración mínima (7 días)
- [ ] Crear vault con duración máxima (365 días)
- [ ] Múltiples vaults del mismo usuario
- [ ] Vault con unlock_time exacto (borde)
