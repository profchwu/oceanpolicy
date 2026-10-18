import { configured } from '@/lib/sheets';
import { BEHAVIOR_VERSION as VERSION } from '@/lib/behavior-model';
export function GET(){return Response.json({configured:configured(),version:VERSION},{headers:{'Cache-Control':'no-store'}});}
