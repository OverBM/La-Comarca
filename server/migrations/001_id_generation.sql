-- ============================================================
-- 001_id_generation.sql
-- Generación de IDs secuenciales + funciones de negocio
-- Ejecutar en pgAdmin contra la BD Comarca
-- ============================================================

-- ============================================================
-- 1. Función genérica generate_id
-- Usa pg_advisory_xact_lock para evitar race conditions
-- ============================================================

CREATE OR REPLACE FUNCTION generate_id(
    p_tabla TEXT,
    p_pk_columna TEXT,
    p_prefijo VARCHAR
) RETURNS VARCHAR(10) AS $$
DECLARE
    lock_key BIGINT;
    max_existente VARCHAR;
    num INTEGER;
BEGIN
    lock_key := ABS(hashtext('generate_id_lock_' || p_tabla));
    PERFORM pg_advisory_xact_lock(lock_key);

    EXECUTE format('SELECT MAX(%I) FROM %I', p_pk_columna, p_tabla) INTO max_existente;

    IF max_existente IS NOT NULL THEN
        num := CAST(SUBSTRING(max_existente FROM LENGTH(p_prefijo) + 1) AS INTEGER) + 1;
    ELSE
        num := 1;
    END IF;

    RETURN p_prefijo || LPAD(num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. Wrappers por tabla
-- ============================================================

-- CATEGORÍAS
CREATE OR REPLACE FUNCTION generate_id_categoria() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('categorias', 'id_categoria', 'CAT');
END;
$$ LANGUAGE plpgsql;

-- PRODUCTOS
CREATE OR REPLACE FUNCTION generate_id_producto() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('productos', 'id_producto', 'PRO');
END;
$$ LANGUAGE plpgsql;

-- USUARIOS
CREATE OR REPLACE FUNCTION generate_id_usuario() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('usuarios', 'id_usuario', 'USU');
END;
$$ LANGUAGE plpgsql;

-- CLIENTES
CREATE OR REPLACE FUNCTION generate_id_cliente() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('clientes', 'id_cliente', 'CLI');
END;
$$ LANGUAGE plpgsql;

-- DIRECCIONES
CREATE OR REPLACE FUNCTION generate_id_direccion() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('direcciones', 'id_direccion', 'DIR');
END;
$$ LANGUAGE plpgsql;

-- CLIENTES_EMPRESA
CREATE OR REPLACE FUNCTION generate_id_empresa() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('clientes_empresa', 'id_empresa', 'EMP');
END;
$$ LANGUAGE plpgsql;

-- PEDIDOS
CREATE OR REPLACE FUNCTION generate_id_pedido() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('pedidos', 'id_pedido', 'PED');
END;
$$ LANGUAGE plpgsql;

-- DETALLE_PEDIDO
CREATE OR REPLACE FUNCTION generate_id_detalle() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('detalle_pedido', 'id_detalle', 'DET');
END;
$$ LANGUAGE plpgsql;

-- COMPROBANTES
CREATE OR REPLACE FUNCTION generate_id_comprobante() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('comprobantes', 'id_comprobante', 'COM');
END;
$$ LANGUAGE plpgsql;

-- INVENTARIO
CREATE OR REPLACE FUNCTION generate_id_inventario() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('inventario', 'id_inventario', 'INV');
END;
$$ LANGUAGE plpgsql;

-- MOVIMIENTOS_INVENTARIO
CREATE OR REPLACE FUNCTION generate_id_movimiento() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('movimientos_inventario', 'id_movimiento', 'MOV');
END;
$$ LANGUAGE plpgsql;

-- TOKENS_RECUPERACION
CREATE OR REPLACE FUNCTION generate_id_token() RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN generate_id('tokens_recuperacion', 'id_token', 'TOK');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. Funciones de negocio
-- ============================================================

-- 3.1 Calcular total de un pedido desde detalle_pedido
CREATE OR REPLACE FUNCTION calcular_total_pedido(p_id_pedido VARCHAR)
RETURNS NUMERIC(10, 2) AS $$
DECLARE
    v_total NUMERIC(10, 2);
BEGIN
    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_total
    FROM detalle_pedido
    WHERE id_pedido = p_id_pedido;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Obtener siguiente serie y correlativo para un tipo de comprobante
DROP FUNCTION IF EXISTS siguiente_correlativo(VARCHAR);
CREATE FUNCTION siguiente_correlativo(p_id_tipo VARCHAR)
RETURNS TABLE(out_serie VARCHAR, out_correlativo VARCHAR) AS $$
DECLARE
    v_serie_base VARCHAR;
    v_ultimo_correlativo VARCHAR;
    v_siguiente_num INTEGER;
BEGIN
    SELECT tc.serie_base INTO v_serie_base
    FROM tipos_comprobante tc
    WHERE tc.id_tipo = p_id_tipo;

    IF v_serie_base IS NULL THEN
        RAISE EXCEPTION 'Tipo de comprobante no válido: %', p_id_tipo;
    END IF;

    SELECT c.correlativo INTO v_ultimo_correlativo
    FROM comprobantes c
    WHERE c.serie LIKE v_serie_base || '%'
    ORDER BY c.correlativo DESC
    LIMIT 1;

    IF v_ultimo_correlativo IS NOT NULL THEN
        v_siguiente_num := CAST(v_ultimo_correlativo AS INTEGER) + 1;
    ELSE
        v_siguiente_num := 1;
    END IF;

    out_serie := v_serie_base;
    out_correlativo := LPAD(v_siguiente_num::TEXT, 8, '0');
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 3.3 Actualizar stock y registrar movimiento de inventario
DROP FUNCTION IF EXISTS actualizar_stock(VARCHAR, INTEGER, VARCHAR, VARCHAR, VARCHAR);
CREATE FUNCTION actualizar_stock(
    p_id_producto VARCHAR,
    p_cantidad INTEGER,
    p_tipo VARCHAR,
    p_motivo VARCHAR,
    p_id_usuario VARCHAR
) RETURNS TABLE(
    id_movimiento VARCHAR,
    id_producto VARCHAR,
    tipo VARCHAR,
    cantidad INTEGER,
    motivo VARCHAR,
    id_usuario VARCHAR,
    fecha TIMESTAMP
) AS $$
DECLARE
    v_id_inventario VARCHAR;
    v_stock_actual INTEGER;
    v_stock_minimo INTEGER;
    v_nuevo_stock INTEGER;
    v_id_movimiento VARCHAR;
BEGIN
    SELECT inv.id_inventario, inv.stock_actual, inv.stock_minimo
    INTO v_id_inventario, v_stock_actual, v_stock_minimo
    FROM inventario inv
    WHERE inv.id_producto = p_id_producto;

    IF v_id_inventario IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado en inventario: %', p_id_producto;
    END IF;

    IF p_tipo = 'salida' THEN
        v_nuevo_stock := v_stock_actual - p_cantidad;
    ELSIF p_tipo = 'entrada' THEN
        v_nuevo_stock := v_stock_actual + p_cantidad;
    ELSE
        v_nuevo_stock := p_cantidad;
    END IF;

    UPDATE inventario inv
    SET stock_actual = v_nuevo_stock,
        ultima_actualizacion = NOW()
    WHERE inv.id_inventario = v_id_inventario;

    v_id_movimiento := generate_id('movimientos_inventario', 'id_movimiento', 'MOV');

    INSERT INTO movimientos_inventario (id_movimiento, id_producto, tipo, cantidad, motivo, id_usuario)
    VALUES (v_id_movimiento, p_id_producto, p_tipo, p_cantidad, p_motivo, p_id_usuario);

    RETURN QUERY
    SELECT m.id_movimiento, m.id_producto, m.tipo, m.cantidad, m.motivo, m.id_usuario, m.fecha
    FROM movimientos_inventario m
    WHERE m.id_movimiento = v_id_movimiento;
END;
$$ LANGUAGE plpgsql;
