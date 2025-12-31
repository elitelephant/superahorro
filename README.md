# SuperAhorro

> Una herramienta simple para mantener la disciplina finciera.

## El Problema

Muchas personas compran cripto con la intención de holdear a largo plazo, pero terminan desviándose de su plan original. En la mayoría de los casos, no es un problema de información ni de convicción, sino de **disciplina**. Mantener un plan financiero en el tiempo resulta difícil cuando las decisiones dependen únicamente de la fuerza de voluntad.

## La Solución

A través de una interfaz web, puedes crear bóvedas con una duración definida y una penalización fija por retiro anticipado.

Una vez creada la bóveda, sus reglas no pueden modificarse. La disciplina no depende de tu fuerza de voluntad ni de un intermediario, sino de reglas programadas que se cumplen automáticamente.

Actualmente, las bóvedas permiten proteger **Lumens**, con la intención de extenderse a otros activos dentro del ecosistema.

## Estado del Proyecto

### En Testnet - Funcionando

El contrato está desplegado y operativo en Stellar Testnet:

- **Contract ID**: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`
- **Red**: Test SDF Network (Stellar Testnet)
- **Explorador**: [Ver en Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2)

### Lo Que Funciona Bien

**En Producción (Testnet):**

La aplicación está completamente funcional en testnet. Puedes conectar tu wallet Freighter y crear bóvedas con períodos de bloqueo personalizados que van desde 7 días hasta un año completo. La interfaz te muestra tu balance de XLM en tiempo real antes de crear una bóveda, y una vez creadas, puedes ver todas tus bóvedas listadas con sus datos actualizados: cuánto guardaste, cuándo se desbloquean, y qué opciones tienes disponibles.

Los retiros anticipados funcionan correctamente con la penalización del 7% aplicada automáticamente por el contrato. La interfaz es responsive y funciona bien tanto en desktop como en móvil, lo cual es importante porque quieres poder revisar tus ahorros desde cualquier dispositivo.

### Lo Que Necesita Mejorar

**En Producción:**

Los retiros normales (después de que expire el período de bloqueo) están implementados y funcionan técnicamente, pero admito que no he podido validarlos completamente con pruebas reales esperando 7+ días. La lógica del contrato es correcta, pero la validación práctica está pendiente.

También está el tema de la memoria del usuario: no hay historial de transacciones en la interfaz, así que tienes que recordar por tu cuenta qué operaciones realizaste. Los mensajes de error existen, pero podrían ser mucho más claros y específicos para ayudarte a entender exactamente qué salió mal. Y aunque el README ahora está en español, la interfaz sigue completamente en inglés—eso es lo siguiente en la lista de mejoras.

Otro detalle que falta es el feedback visual durante las transacciones. Cuando firmas algo en Freighter, no hay una confirmación visual clara de que la transacción está procesándose, lo cual puede generar confusión.

### Lo Que Falta

La lista de cosas pendientes es honesta y realista. Primero y más importante: **no hay auditoría de seguridad profesional**. El código está abierto y puede revisarse, pero no ha pasado por un proceso formal de auditoría. Por eso seguimos en testnet y no se recomienda usar fondos reales todavía.

El despliegue en mainnet está esperando justamente esa validación y auditoría. No tiene sentido apresurarse cuando se trata de dinero real de personas reales.

En cuanto a funcionalidad, la visión incluye bóvedas que puedan contener múltiples activos (no solo XLM), y condiciones de desbloqueo más sofisticadas basadas en precio u otras variables del mercado. También está la idea de un sistema de distribución colectiva de las penalizaciones—que los retiros anticipados alimenten una bóveda común que se distribuya bajo ciertas condiciones, agregando una dimensión social al ahorro.

Tampoco hay analytics ni dashboard de estadísticas para ver patrones de ahorro, tasas de retiro anticipado, o cualquier métrica que ayude a entender mejor el comportamiento de ahorro. Y desde luego, falta una aplicación móvil nativa—por ahora todo es web.

## Por Qué Stellar

Stellar está diseñada para el uso financiero cotidiano. Su ecosistema ya gira en torno a pagos, ahorro y estabilidad, lo que la convierte en una red especialmente adecuada para una aplicación de finanzas descentralizadas simple y de bajo riesgo como SuperAhorro.

Dentro del ecosistema, aún existen pocas herramientas enfocadas específicamente en el ahorro y la disciplina financiera. **SuperAhorro busca ocupar ese espacio**.

## Tecnología

El contrato está escrito en Rust usando Soroban (contratos inteligentes de Stellar). El frontend usa Next.js 14 con TypeScript, Chakra UI, y se integra con Freighter wallet vía @soroban-react. El proyecto está basado en el [Soroban React Boilerplate](https://github.com/paltalabs/soroban-react-boilerplate) de PaltaLabs.

## Advertencia

**Importante**: SuperAhorro está en **testnet** y no ha sido auditado. Es un proyecto de experimentación. No uses fondos reales.

## Cierre

SuperAhorro no busca maximizar retornos ni ofrecer yields complejos. **Busca ayudar a las personas a cumplir el plan financiero que ellas mismas definieron**, confiando en reglas claras y simples en lugar de la fuerza de voluntad.

Si eso resuena contigo, dale una oportunidad en testnet y comparte tu feedback.

---

**SuperAhorro** - Hecho con disciplina en Stellar  