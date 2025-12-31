# SuperAhorro

> Una herramienta simple para mantener el plan financiero que tú mismo definiste.

## El Problema

Muchas personas compran cripto con la intención de holdear a largo plazo, pero terminan desviándose de su plan original. En la mayoría de los casos, no es un problema de información ni de convicción, sino de **disciplina**. Mantener un plan financiero en el tiempo resulta difícil cuando las decisiones dependen únicamente de la fuerza de voluntad.

## La Solución

SuperAhorro es una herramienta de ahorro simple basada en **reglas predefinidas**. A través de una interfaz web, puedes crear bóvedas con una duración definida y una penalización fija por retiro anticipado.

Una vez creada la bóveda, sus reglas no pueden modificarse. La disciplina no depende de tu fuerza de voluntad ni de un intermediario, sino de reglas programadas que se cumplen automáticamente.

Actualmente, las bóvedas permiten proteger **Lumens (XLM)**, con la intención de extenderse a otros activos dentro del ecosistema.

## Estado del Proyecto

### 🟢 En Testnet - Funcionando

El contrato está desplegado y operativo en Stellar Testnet:

- **Contract ID**: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`
- **Red**: Test SDF Network (Stellar Testnet)
- **Explorador**: [Ver en Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2)

### ✅ Lo Que Funciona Bien

**En Producción (Testnet):**
- ✅ Crear bóvedas con períodos de bloqueo personalizados (7-365 días)
- ✅ Mostrar el balance de XLM en tiempo real
- ✅ Listar todas las bóvedas del usuario con datos actualizados
- ✅ Retiros anticipados con penalización del 7%
- ✅ Integración con la wallet Freighter
- ✅ Interfaz responsive que funciona en móvil

**En Desarrollo:**
- ✅ El contrato se compila y despliega sin problemas
- ✅ Los tests unitarios del contrato pasan correctamente
- ✅ La generación de bindings de TypeScript funciona
- ✅ El servidor de desarrollo levanta rápido
- ✅ Hot reload funciona bien para cambios en el frontend

### 🟡 Lo Que Necesita Mejorar

**En Producción:**
- ⚠️ Los retiros normales (después del período de bloqueo) funcionan, pero no están completamente validados con pruebas reales de 7+ días
- ⚠️ No hay historial de transacciones, tienes que recordar qué hiciste
- ⚠️ Los mensajes de error podrían ser más claros y específicos
- ⚠️ La interfaz está solo en inglés (esto es lo siguiente en la lista)
- ⚠️ No hay confirmación visual cuando una transacción está en proceso

**En Desarrollo:**
- ⚠️ El tiempo de compilación del contrato Rust es un poco largo (~30-60 segundos)
- ⚠️ La sincronización entre el contrato y los bindings de TypeScript requiere compilar manualmente
- ⚠️ No hay tests de integración automatizados (solo pruebas manuales por ahora)
- ⚠️ El setup inicial requiere instalar Stellar CLI y configurar todo manualmente

### ❌ Lo Que Falta

- ❌ Auditoría de seguridad profesional
- ❌ Despliegue en mainnet (esperando validación y auditoría)
- ❌ Bóvedas con múltiples activos
- ❌ Condiciones basadas en precio u otras variables
- ❌ Sistema de distribución colectiva de las penalizaciones
- ❌ Analytics y dashboard de estadísticas
- ❌ Aplicación móvil nativa

## Por Qué Stellar

Stellar está diseñada para el uso financiero cotidiano. Su ecosistema ya gira en torno a pagos, ahorro y estabilidad, lo que la convierte en una red especialmente adecuada para una aplicación de finanzas descentralizadas simple y de bajo riesgo como SuperAhorro.

Dentro del ecosistema, aún existen pocas herramientas enfocadas específicamente en el ahorro y la disciplina financiera. **SuperAhorro busca ocupar ese espacio**.

## Cómo Empezar

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/elitelephant/superahorro.git
cd superahorro

# Instalar dependencias del frontend
npm install

# Compilar el contrato (requiere Stellar CLI)
cd contracts/vault
stellar contract build
```

### Desarrollo Local

```bash
# Iniciar el servidor de desarrollo
npm run dev
# Abre http://localhost:3000 en tu navegador
```

### Compilar para Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
superahorro/
├── contracts/vault/          # Contrato inteligente en Soroban (Rust)
│   ├── src/lib.rs           # Lógica principal del contrato
│   └── test_snapshots/      # Resultados de los tests
├── src/
│   ├── components/vault/    # Componentes de UI para bóvedas
│   │   ├── VaultForm.tsx    # Formulario de creación + balance
│   │   ├── VaultList.tsx    # Lista de bóvedas del usuario
│   │   └── VaultCard.tsx    # Detalle y acciones de cada bóveda
│   ├── components/web3/     # Integración con wallet
│   └── contracts/src/       # Bindings generados de TypeScript
└── public/                  # Recursos estáticos
```

## API del Contrato

### Funciones Principales

**`create_vault(owner, amount, lock_duration_days) -> u64`**
- Crea una bóveda bloqueada por tiempo (7-365 días)
- El monto se especifica en stroops (1 XLM = 10,000,000 stroops)
- Devuelve el ID de la bóveda creada

**`withdraw(vault_id)`**
- Retira fondos después de que expire el período de bloqueo
- Devuelve el monto completo al propietario

**`early_withdraw(vault_id)`**
- Retira antes del período establecido
- Aplica una penalización del 7% (va al administrador)
- Devuelve el 93% del monto al propietario

**`get_vault(vault_id) -> Vault`**
- Obtiene los detalles de una bóveda específica

**`get_vault_count() -> u64`**
- Devuelve el total de bóvedas creadas

## Stack Técnico

- **Blockchain**: Stellar Soroban (contratos en Rust)
- **Frontend**: Next.js 14 + TypeScript
- **UI**: Chakra UI + twin.macro + Styled Components
- **Wallet**: Freighter vía @soroban-react
- **Despliegue**: Vercel
- **Boilerplate Base**: [Soroban React Boilerplate](https://github.com/paltalabs/soroban-react-boilerplate) de PaltaLabs

### Lo Que Construimos vs Lo Que Viene del Boilerplate

**Del Boilerplate (gracias PaltaLabs):**
- Estructura base del proyecto
- MySorobanReactProvider (contexto de wallet)
- ConnectButton (integración con Freighter)
- ChainInfo component
- Configuración de Next.js y TypeScript

**Construido desde cero:**
- Todo el contrato de bóvedas en Rust/Soroban
- Todos los componentes de UI para bóvedas
- Lógica de interacción con el contrato
- Generación de bindings de TypeScript

## Visión a Futuro

La visión detrás de SuperAhorro va más allá de una simple bóveda bloqueada por tiempo. El objetivo es explorar:

- **Bóvedas multi-activo**: No solo XLM, sino también otros tokens del ecosistema Stellar
- **Condiciones dinámicas**: Bóvedas que se desbloqueen no solo por tiempo, sino por precio u otras condiciones
- **Dimensión colectiva**: Las penalizaciones podrían alimentar una bóveda común que se distribuya bajo ciertas condiciones, incorporando un aspecto social sin perder la lógica individual

## Seguridad

⚠️ **Importante**: SuperAhorro está actualmente en **testnet** y no ha sido auditado profesionalmente. No uses fondos reales hasta que esté en mainnet con auditoría completa.

**Principios de seguridad:**
- Los fondos están bloqueados en contratos auditables públicamente
- No hay acceso administrativo a los fondos de los usuarios
- Código abierto y verificable en la blockchain
- Desarrollo testnet-first

## Testing

Consulta [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) para la guía completa de pruebas manuales que cubre:
- Conexión de wallet
- Creación de bóvedas
- Listado de bóvedas
- Retiros normales
- Retiros anticipados con penalización
- Casos extremos

## Contribuir

Las contribuciones son bienvenidas. Si quieres ayudar:

1. Haz un fork del repositorio
2. Crea una rama para tu feature
3. Prueba tus cambios exhaustivamente
4. Envía un pull request con una descripción clara

Áreas donde más necesitamos ayuda:
- Tests automatizados de integración
- Auditoría de seguridad
- Mejoras en la UX/UI
- Documentación en español
- Soporte para más wallets

## Cierre

SuperAhorro no busca maximizar retornos ni ofrecer yields complejos. **Busca ayudar a las personas a cumplir el plan financiero que ellas mismas definieron**, confiando en reglas claras y simples en lugar de la fuerza de voluntad.

Si eso resuena contigo, dale una oportunidad en testnet y comparte tu feedback.

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

---

Hecho con disciplina 💪 en Stellar

## 🔗 Links

- **Contract Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)

## 💬 Support

For questions or issues:
- Open a [GitHub Issue](https://github.com/elitelephant/superahorro/issues)
- Stellar Discord: [@StellarOrg](https://discord.gg/stellar)

---

🌟 **SuperAhorro** - Ahorra con disciplina, gana con constancia  
💰 Built on Stellar Soroban | 🔒 Time-Locked Savings | ⚡ Ultra-Low Fees
