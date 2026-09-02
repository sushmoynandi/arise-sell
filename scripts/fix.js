const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Fix billing.py
const billingPath = path.join(rootDir, 'backend', 'app', 'api', 'v1', 'billing.py');
let billing = fs.readFileSync(billingPath, 'utf8');
billing = billing.replace('amountBDT: 350.0,', 'amountBDT=350.0,');
fs.writeFileSync(billingPath, billing, 'utf8');
console.log('1. Fixed billing.py syntax');

// 2. Fix Celery queues in docker-compose.yml
const dcPath = path.join(rootDir, 'backend', 'docker-compose.yml');
let dc = fs.readFileSync(dcPath, 'utf8');
dc = dc.replace(
  '-Q default,webhooks,ai_inference,notifications',
  '-Q default,webhooks,ai_inference,campaigns,maintenance,notifications'
);
fs.writeFileSync(dcPath, dc, 'utf8');
console.log('2. Fixed docker-compose.yml queues');

// 3. Fix admin dependencies in all admin files
const adminDir = path.join(rootDir, 'backend', 'app', 'api', 'v1', 'admin');
fs.readdirSync(adminDir).forEach(f => {
  if (f.endsWith('.py') && f !== '__init__.py') {
    const p = path.join(adminDir, f);
    let code = fs.readFileSync(p, 'utf8');
    if (!code.includes('get_current_superadmin')) {
      code = code.replace(
        'from fastapi import APIRouter',
        'from fastapi import APIRouter, Depends\nfrom app.core.deps import get_current_superadmin'
      );
      code = code.replace(
        /router = APIRouter\((.*?)\)/,
        'router = APIRouter($1, dependencies=[Depends(get_current_superadmin)])'
      );
      fs.writeFileSync(p, code, 'utf8');
      console.log('Secured admin router:', f);
    }
  }
});

// 4. Create baseline alembic migration
const migPath = path.join(rootDir, 'backend', 'alembic', 'versions', '0001_initial_schema.py');
const migContent = `"""Initial multi-tenant schema baseline

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-02 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
`;
fs.writeFileSync(migPath, migContent, 'utf8');
console.log('4. Created alembic migration baseline');

// 5. Fix webhooks mandatory HMAC verification
const metaWebPath = path.join(rootDir, 'backend', 'app', 'api', 'webhooks', 'meta.py');
let metaWeb = fs.readFileSync(metaWebPath, 'utf8');
metaWeb = metaWeb.replace(
  'if settings.META_APP_SECRET and x_hub_signature_256:',
  'if settings.META_APP_SECRET:\n        if not x_hub_signature_256 or not verify_webhook_signature(body, x_hub_signature_256, settings.META_APP_SECRET):\n            raise HTTPException(status_code=403, detail="Invalid HMAC signature")'
);
fs.writeFileSync(metaWebPath, metaWeb, 'utf8');
console.log('5. Fixed Meta webhook signature verification');

console.log('✅ ALL FIXES APPLIED SUCCESSFULLY!');
