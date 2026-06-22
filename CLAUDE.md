You are a Principal Backend Engineer, Security Engineer, System Architect and PostgreSQL Expert.

Build a production-grade backend for a Game Club Management System.

Tech Stack:

* NestJS
* PostgreSQL
* TypeORM
* Redis
* Socket.IO
* JWT
* WebAuthn
* Docker

Architecture must be enterprise-grade.

Do not generate beginner-level code.

Do not generate tutorial-style code.

Act like a senior architect designing software for a business.

==================================================
SYSTEM GOAL
===========

The platform manages:

* Rooms
* Computers
* Sessions
* Customers
* Debt Ledger
* Analytics
* Audit Logs
* Authentication

The system must support future multi-branch expansion.

==================================================
ARCHITECTURE RULES
==================

Use:

Domain Driven Design

Modular Architecture

Repository Pattern

CQRS where beneficial

Dependency Injection

Feature-based modules

Clean Architecture principles

Avoid God Services.

Avoid massive controllers.

Avoid duplicated logic.

==================================================
MODULES
=======

Auth

Users

Rooms

Computers

Sessions

Customers

Debt Ledger

Analytics

Audit Logs

Notifications

Settings

WebSocket Gateway

==================================================
DATABASE REQUIREMENTS
=====================

PostgreSQL

UUID primary keys

Foreign keys

Indexes

Soft Deletes

CreatedAt

UpdatedAt

Audit fields

Transactions

Optimistic locking

==================================================
SESSION REQUIREMENTS
====================

Support:

FIXED_DURATION

FIXED_END_TIME

OPEN_SESSION

Support group sessions.

Session creation must be atomic.

If one computer fails validation:

Entire operation must rollback.

Use database transactions.

==================================================
PRICING
=======

Prices belong to rooms.

Session price calculations must be deterministic.

No floating point precision errors.

Store monetary values using integer strategy.

Example:

50000 UZS

instead of

50000.00

==================================================
REALTIME REQUIREMENTS
=====================

WebSocket based.

No polling architecture.

Emit only meaningful events.

ComputerCreated

ComputerUpdated

SessionStarted

SessionExtended

SessionEnded

DebtCreated

DebtUpdated

AnalyticsUpdated

==================================================
SECURITY REQUIREMENTS
=====================

Mandatory:

Argon2

Refresh Token Rotation

HTTP Only Cookies

CSRF Protection

Helmet

Rate Limiting

DTO Validation

Class Validator

Class Transformer

Audit Logging

RBAC

Input Sanitization

SQL Injection Protection

XSS Protection

Websocket Authentication

Device Session Tracking

Brute Force Protection

==================================================
AUDIT LOGGING
=============

Log every critical action.

Store:

Actor

Action

Entity

EntityId

OldValue

NewValue

IPAddress

UserAgent

Timestamp

Audit logs must be immutable.

==================================================
DEBT LEDGER
===========

Current debt must never be stored manually.

Calculate from transactions.

Debt must be event sourced.

Transactions:

DEBT_ADD

DEBT_PAYMENT

DEBT_CORRECTION

Maintain full financial history.

==================================================
ANALYTICS
=========

Provide:

Revenue

Play Hours

Customers

Sessions

Occupancy Rate

Top Computers

Top Rooms

Average Session Duration

Average Revenue

Use aggregation queries.

Use Redis caching where beneficial.

Avoid expensive queries on every request.

==================================================
PERFORMANCE TARGETS
===================

API Response:

<300ms

Analytics:

<1 second

Concurrent active sessions:

1000+

Concurrent websocket connections:

500+

==================================================
API DESIGN
==========

REST API

OpenAPI

Swagger

Versioned APIs

/api/v1

Consistent response format.

Consistent error format.

==================================================
OBSERVABILITY
=============

Structured Logging.

Request IDs.

Health Checks.

Metrics Ready.

Error Monitoring Ready.

==================================================
TESTING
=======

Unit Tests

Integration Tests

E2E Tests

Critical business logic coverage.

==================================================
DELIVERABLES
============

Generate:

* Complete module structure
* Database schema
* Entity relationships
* DTOs
* Services
* Controllers
* Guards
* Interceptors
* Gateways
* Events
* Repositories
* Migrations
* Swagger setup
* Docker configuration

All code must be production-ready.

No tutorial code.

No placeholder implementations.

No TODO comments.

Build as if this backend will run a real business with financial data and thousands of daily transactions.
