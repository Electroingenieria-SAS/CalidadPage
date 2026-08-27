export type LegalPolicy = {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  sections: Array<{ title: string; body: string[] }>;
  references?: Array<{ label: string; href: string }>;
};

export const LEGAL_LAST_UPDATED = "27 de agosto de 2026";

export const DESIGNER_CONTACT = {
  name: "Juan Esteban Pérez",
  role: "Analista de Calidad",
  organization: "Electroingeniería S.A.S.",
  corporateEmail: "j.perez@ei.com.co",
  phone: "+57 318 388 3324",
  phoneDial: "+573183883324",
  personalEmails: ["juanespereztobon.1204@gmail.com", "juanes.1205@hotmail.com"],
} as const;

export const LEGAL_POLICIES: LegalPolicy[] = [
  {
    id: "privacidad",
    shortTitle: "Privacidad",
    title: "Política de privacidad y tratamiento de datos personales",
    summary: "Explica qué datos usa el portal, para qué se usan y cómo ejercer los derechos de los titulares.",
    sections: [
      {
        title: "1. Responsable y alcance",
        body: [
          "Este portal institucional es operado para Electroingeniería S.A.S. y está destinado principalmente a usuarios autorizados del repositorio de Calidad y Mejora Continua.",
          "Esta política específica del portal complementa, y no sustituye, las políticas corporativas generales de tratamiento de información que Electroingeniería S.A.S. tenga vigentes por otros canales.",
        ],
      },
      {
        title: "2. Datos tratados",
        body: [
          "El portal puede tratar datos de identificación y contacto asociados a la cuenta (por ejemplo nombre, correo corporativo, rol, área y estado), datos técnicos de sesión y acceso, permisos asignados, acciones administrativas necesarias para la operación y datos aportados por el propio usuario en funcionalidades habilitadas.",
          "Cuando un recurso se protege con la función “Solo con cédula”, el sistema utiliza el número suministrado únicamente para validar el acceso. La arquitectura conserva un verificador criptográfico en el backend privado y evita exponer la cédula en las tablas visibles al navegador.",
        ],
      },
      {
        title: "3. Finalidades",
        body: [
          "Autenticar usuarios; aplicar controles de acceso por rol; proteger contenido institucional; administrar usuarios y permisos; mantener trazabilidad operativa y de seguridad; prestar funcionalidades del portal; atender solicitudes de soporte; prevenir abuso, fraude o acceso no autorizado; y mejorar estabilidad, usabilidad y seguridad.",
          "Los datos no se utilizan para publicidad comportamental ni se comercializan desde este portal.",
        ],
      },
      {
        title: "4. Derechos del titular",
        body: [
          "Los titulares pueden conocer, actualizar y rectificar sus datos; solicitar prueba de la autorización cuando aplique; ser informados sobre el uso dado a sus datos; presentar consultas o reclamos; solicitar supresión o revocatoria cuando legalmente proceda; y acceder gratuitamente a sus datos personales en los términos de la normativa aplicable.",
          "Las solicitudes relacionadas con este portal pueden dirigirse inicialmente al canal corporativo del administrador del portal: j.perez@ei.com.co, sin perjuicio de los canales institucionales que Electroingeniería S.A.S. tenga definidos para protección de datos.",
        ],
      },
      {
        title: "5. Seguridad, conservación y terceros tecnológicos",
        body: [
          "El portal aplica autenticación, control de acceso por rol, Row Level Security (RLS), HTTPS, separación de secretos y funciones de backend para reducir exposición de información. Ningún control elimina por completo el riesgo tecnológico; por ello se mantiene un enfoque de mejora continua y mínimo privilegio.",
          "Los datos se conservarán durante el tiempo necesario para las finalidades autorizadas, obligaciones legales, continuidad operativa, auditoría y seguridad, y se eliminarán o anonimizarán cuando corresponda.",
          "Para prestar el servicio se utilizan proveedores tecnológicos de infraestructura y backend. Su tratamiento queda limitado a la prestación técnica del servicio y a las configuraciones contractuales y de seguridad aplicables.",
        ],
      },
    ],
    references: [
      { label: "Ley 1581 de 2012 — Protección de datos personales", href: "https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes%2F1684507" },
      { label: "Decreto 1074 de 2015 — Régimen reglamentario", href: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76608" },
      { label: "Superintendencia de Industria y Comercio — RNBD", href: "https://rnbd.sic.gov.co/sisi/login" },
    ],
  },
  {
    id: "cookies",
    shortTitle: "Cookies",
    title: "Política de cookies y almacenamiento local",
    summary: "Describe el almacenamiento estrictamente necesario para sesión, preferencias y funciones locales del portal.",
    sections: [
      {
        title: "1. Uso actual",
        body: [
          "El portal utiliza mecanismos de almacenamiento del navegador necesarios para autenticación, persistencia de sesión, preferencias técnicas y determinadas funciones locales del juego, como el ranking guardado en el dispositivo.",
          "En la configuración actual no se incorporan cookies publicitarias ni trackers de marketing dentro de la aplicación.",
        ],
      },
      {
        title: "2. Categorías",
        body: [
          "Esenciales: permiten autenticación, seguridad y funcionamiento básico. Funcionales: recuerdan preferencias o estado local cuando la funcionalidad lo requiere.",
          "Si en el futuro se incorporan analítica, medición de rendimiento de terceros o marketing que implique almacenamiento no esencial o tratamiento adicional de datos, deberá actualizarse esta política y evaluarse el mecanismo de consentimiento correspondiente antes de activarlo.",
        ],
      },
      {
        title: "3. Control del usuario",
        body: [
          "El usuario puede eliminar almacenamiento del sitio desde la configuración de su navegador. Hacerlo puede cerrar la sesión, borrar preferencias o eliminar datos locales del juego.",
        ],
      },
    ],
    references: [
      { label: "SIC — Referencia sobre categorías de cookies", href: "https://sedeelectronica.sic.gov.co/cookies/documentation" },
    ],
  },
  {
    id: "terminos",
    shortTitle: "Términos",
    title: "Términos y condiciones de uso",
    summary: "Reglas de acceso, uso aceptable, credenciales, contenido y responsabilidad del usuario.",
    sections: [
      {
        title: "1. Uso autorizado",
        body: [
          "El acceso al portal se limita a usuarios autorizados y a los contenidos habilitados para su rol. Una cuenta, enlace protegido o credencial no debe compartirse con terceros no autorizados.",
          "El usuario es responsable de mantener la confidencialidad de sus credenciales, cerrar sesión en equipos compartidos y reportar accesos o comportamientos sospechosos.",
        ],
      },
      {
        title: "2. Conductas no permitidas",
        body: [
          "No se permite intentar eludir controles de acceso, extraer información fuera del alcance autorizado, alterar el servicio, automatizar ataques, introducir software malicioso, compartir contenido clasificado sin autorización, suplantar identidades o utilizar el portal para finalidades contrarias a la ley o a las políticas corporativas.",
        ],
      },
      {
        title: "3. Disponibilidad y cambios",
        body: [
          "El portal puede recibir cambios, mantenimiento, actualizaciones de seguridad o ajustes de contenido. La disponibilidad continua no se garantiza frente a mantenimientos, fallos de terceros, incidentes o causas de fuerza mayor.",
        ],
      },
      {
        title: "4. Registros electrónicos",
        body: [
          "Las interacciones y comunicaciones electrónicas generadas por el sistema pueden constituir mensajes de datos y conservarse con fines operativos, de trazabilidad, evidencia o cumplimiento, de acuerdo con la legislación aplicable.",
        ],
      },
    ],
    references: [
      { label: "Ley 527 de 1999 — Mensajes de datos", href: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4276" },
      { label: "Ley 1273 de 2009 — Protección de información y sistemas", href: "https://www.suin-juriscol.gov.co/viewDocument.asp?id=1676699" },
    ],
  },
  {
    id: "seguridad",
    shortTitle: "Seguridad",
    title: "Política de seguridad digital y acceso",
    summary: "Principios de mínimo privilegio, autenticación, reporte de incidentes y responsabilidades compartidas.",
    sections: [
      {
        title: "1. Principios",
        body: [
          "El portal aplica mínimo privilegio, defensa en profundidad, separación entre cliente y secretos de servidor, control por roles, validación de sesión, HTTPS y restricciones a nivel de base de datos.",
          "Los controles se revisan de forma continua y pueden modificarse cuando cambien riesgos, dependencias o requisitos internos.",
        ],
      },
      {
        title: "2. Responsabilidad del usuario",
        body: [
          "El usuario debe utilizar contraseñas robustas, evitar reutilizarlas, proteger su dispositivo, no desactivar controles de seguridad corporativos y reportar inmediatamente pérdida de acceso, exposición de credenciales o actividad anómala.",
        ],
      },
      {
        title: "3. Reporte",
        body: [
          "Los incidentes relacionados con este portal deben reportarse al canal administrativo/técnico disponible en el propio portal o al correo j.perez@ei.com.co, aportando únicamente la información necesaria para investigar el evento.",
        ],
      },
    ],
    references: [
      { label: "Ley 1273 de 2009 — Delitos informáticos", href: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=34492" },
    ],
  },
  {
    id: "propiedad",
    shortTitle: "Propiedad intelectual",
    title: "Propiedad intelectual y derechos de autor",
    summary: "Define el tratamiento del software, diseño, contenidos institucionales, marcas y materiales de terceros.",
    sections: [
      {
        title: "1. Contenido y software",
        body: [
          "El código, diseño, documentación, piezas gráficas, bases documentales, marcas, logotipos y demás activos publicados conservan la titularidad o licencia que corresponda a Electroingeniería S.A.S., sus autores, proveedores o terceros titulares.",
          "La mención de diseño y desarrollo acredita la participación técnica del creador del portal, pero no implica por sí sola transferencia o declaración de titularidad sobre activos corporativos o de terceros.",
        ],
      },
      {
        title: "2. Uso interno",
        body: [
          "La visualización o descarga autorizada de un recurso no concede licencia para redistribuirlo, comercializarlo, modificarlo o publicarlo externamente salvo autorización expresa o licencia aplicable.",
        ],
      },
      {
        title: "3. Aviso de copyright",
        body: [
          "El portal utiliza el aviso © 2026. Todos los derechos reservados. El símbolo ® no se utiliza para afirmar registro marcario mientras no exista confirmación documental de dicho registro.",
        ],
      },
    ],
    references: [
      { label: "Ley 23 de 1982 — Derechos de autor", href: "https://www.derechodeautor.gov.co/es/ley-23-del-28-de-enero-de-1982-ley-de-derechos-de-autor" },
    ],
  },
  {
    id: "accesibilidad",
    shortTitle: "Accesibilidad",
    title: "Declaración de accesibilidad y experiencia inclusiva",
    summary: "Compromiso de diseño responsive, navegación por teclado, contraste y reducción de movimiento.",
    sections: [
      {
        title: "1. Objetivo",
        body: [
          "El portal busca ofrecer una experiencia usable en computadores, tablets y teléfonos, con jerarquía visual clara, controles táctiles adecuados, navegación por teclado, etiquetas accesibles y soporte para preferencias de reducción de movimiento.",
          "Este texto expresa un objetivo de diseño y mejora continua; no constituye una certificación formal de conformidad WCAG salvo que exista una auditoría específica que así lo determine.",
        ],
      },
      {
        title: "2. Reporte de barreras",
        body: [
          "Si un usuario encuentra una barrera de lectura, navegación, contraste, tamaño, teclado o dispositivo, puede reportarla al contacto del diseñador/administrador publicado en el portal para evaluación y corrección.",
        ],
      },
    ],
  },
];
