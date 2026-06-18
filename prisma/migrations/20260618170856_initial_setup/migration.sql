-- CreateEnum
CREATE TYPE "modalidad" AS ENUM ('VIRTUAL', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "estado_tutoria" AS ENUM ('PROGRAMADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "estado_asistencia" AS ENUM ('CONFIRMADA', 'ASISTIDA', 'INASISTIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('estudiante', 'tutor', 'admin');

-- CreateTable
CREATE TABLE "usuario_local" (
    "user_id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "apellido" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254),
    "rol" "rol_usuario" NOT NULL,
    "ultima_sync" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_local_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "materia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_materia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "materia_id" UUID NOT NULL,
    "tutor_user_id" UUID NOT NULL,
    "autorizada" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sala" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(20) NOT NULL,
    "edificio" VARCHAR(80),
    "capacidad" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franja_horaria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dia_semana" SMALLINT NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,
    "orden" SMALLINT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "franja_horaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad_tutor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_user_id" UUID NOT NULL,
    "franja_id" UUID NOT NULL,
    "materia_id" UUID NOT NULL,
    "sala_id" UUID,
    "modalidad" "modalidad" NOT NULL,
    "cupos_maximos" INTEGER NOT NULL,
    "vigencia_desde" DATE NOT NULL,
    "vigencia_hasta" DATE NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilidad_tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutor_user_id" UUID NOT NULL,
    "franja_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "materia_id" UUID NOT NULL,
    "sala_id" UUID,
    "disponibilidad_id" UUID,
    "modalidad" "modalidad" NOT NULL,
    "estado" "estado_tutoria" NOT NULL DEFAULT 'PROGRAMADA',
    "cupos_maximos" INTEGER NOT NULL,
    "cupos_ocupados" INTEGER NOT NULL DEFAULT 0,
    "enlace_virtual" VARCHAR(500),
    "tema_general" TEXT,
    "motivo_cancelacion" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participante" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutoria_id" UUID NOT NULL,
    "estudiante_user_id" UUID NOT NULL,
    "tema_especifico" VARCHAR(200),
    "descripcion_dudas" TEXT,
    "estado_asistencia" "estado_asistencia" NOT NULL DEFAULT 'CONFIRMADA',
    "reservado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelado_en" TIMESTAMPTZ(6),
    "motivo_cancelacion" TEXT,

    CONSTRAINT "participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluacion_tutoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tutoria_id" UUID NOT NULL,
    "participante_id" UUID NOT NULL,
    "calificacion" SMALLINT NOT NULL,
    "comentario" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluacion_tutoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluacion_participante" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "participante_id" UUID NOT NULL,
    "calificacion" SMALLINT NOT NULL,
    "comentario" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluacion_participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reputacion_tutor" (
    "tutor_user_id" UUID NOT NULL,
    "calificacion_promedio" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "tutorias_realizadas" INTEGER NOT NULL DEFAULT 0,
    "comentarios_recibidos" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reputacion_tutor_pkey" PRIMARY KEY ("tutor_user_id")
);

-- CreateTable
CREATE TABLE "reputacion_estudiante" (
    "estudiante_user_id" UUID NOT NULL,
    "calificacion_promedio" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "tutorias_asistidas" INTEGER NOT NULL DEFAULT 0,
    "tutorias_inasistidas" INTEGER NOT NULL DEFAULT 0,
    "comentarios_recibidos" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reputacion_estudiante_pkey" PRIMARY KEY ("estudiante_user_id")
);

-- CreateIndex
CREATE INDEX "idx_usuario_local_rol" ON "usuario_local"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "materia_codigo_key" ON "materia"("codigo");

-- CreateIndex
CREATE INDEX "idx_tutor_materia_tutor" ON "tutor_materia"("tutor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tutor_materia" ON "tutor_materia"("materia_id", "tutor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sala_codigo_key" ON "sala"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "uq_franja_dia_hora" ON "franja_horaria"("dia_semana", "hora_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "uq_franja_dia_orden" ON "franja_horaria"("dia_semana", "orden");

-- CreateIndex
CREATE INDEX "idx_disp_tutor" ON "disponibilidad_tutor"("tutor_user_id");

-- CreateIndex
CREATE INDEX "idx_disp_materia" ON "disponibilidad_tutor"("materia_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_disp_tutor_franja" ON "disponibilidad_tutor"("tutor_user_id", "franja_id");

-- CreateIndex
CREATE INDEX "idx_tutoria_tutor_fecha" ON "tutoria"("tutor_user_id", "fecha");

-- CreateIndex
CREATE INDEX "idx_tutoria_busqueda" ON "tutoria"("materia_id", "modalidad", "fecha", "estado");

-- CreateIndex
CREATE INDEX "idx_tutoria_disp" ON "tutoria"("disponibilidad_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tutor_franja_fecha" ON "tutoria"("tutor_user_id", "franja_id", "fecha");

-- CreateIndex
CREATE INDEX "idx_participante_estudiante" ON "participante"("estudiante_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_participante_tutoria" ON "participante"("tutoria_id", "estudiante_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluacion_tutoria_participante_id_key" ON "evaluacion_tutoria"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluacion_participante_participante_id_key" ON "evaluacion_participante"("participante_id");

-- AddForeignKey
ALTER TABLE "tutor_materia" ADD CONSTRAINT "tutor_materia_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_tutor" ADD CONSTRAINT "disponibilidad_tutor_franja_id_fkey" FOREIGN KEY ("franja_id") REFERENCES "franja_horaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_tutor" ADD CONSTRAINT "disponibilidad_tutor_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_tutor" ADD CONSTRAINT "disponibilidad_tutor_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoria" ADD CONSTRAINT "tutoria_franja_id_fkey" FOREIGN KEY ("franja_id") REFERENCES "franja_horaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoria" ADD CONSTRAINT "tutoria_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoria" ADD CONSTRAINT "tutoria_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoria" ADD CONSTRAINT "tutoria_disponibilidad_id_fkey" FOREIGN KEY ("disponibilidad_id") REFERENCES "disponibilidad_tutor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_tutoria_id_fkey" FOREIGN KEY ("tutoria_id") REFERENCES "tutoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_tutoria" ADD CONSTRAINT "evaluacion_tutoria_tutoria_id_fkey" FOREIGN KEY ("tutoria_id") REFERENCES "tutoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_tutoria" ADD CONSTRAINT "evaluacion_tutoria_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_participante" ADD CONSTRAINT "evaluacion_participante_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
