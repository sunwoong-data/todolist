-- ============================================================
-- TodoList Database Schema
-- 참조: docs/6-erd.md
-- 작성일: 2026-05-27
-- ============================================================

-- UUID 생성 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users (사용자)
-- ============================================================
CREATE TABLE users (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,                          -- bcrypt 해시값
    name                VARCHAR(100) NOT NULL,
    theme_preference    VARCHAR(10)  NOT NULL DEFAULT 'light'
                            CHECK (theme_preference IN ('light', 'dark')),   -- BR-13 [v2]
    language_preference VARCHAR(5)   NOT NULL DEFAULT 'ko'
                            CHECK (language_preference IN ('ko', 'en', 'ja')), -- BR-15 [v2]
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. categories (카테고리)
-- ============================================================
CREATE TABLE categories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    UNIQUE (user_id, name)  -- BR: 동일 사용자 내 카테고리명 고유
);

-- ============================================================
-- 3. todos (할 일)
-- ============================================================
CREATE TABLE todos (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  UUID         NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,                   -- NULL 허용 (BR-07)
    start_date   DATE,                   -- NULL 허용 (BR-07)
    end_date     DATE,                   -- NULL 허용 (BR-07)
    is_completed BOOLEAN      NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. 인덱스
-- ============================================================

-- 사용자별 카테고리 목록 조회 성능
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- 사용자별 할 일 목록 조회 성능 (BR-02, PRD 성능 기준)
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- 카테고리별 필터링 조회 성능 (BR-08, PRD 성능 기준)
CREATE INDEX idx_todos_category_id ON todos(category_id);
