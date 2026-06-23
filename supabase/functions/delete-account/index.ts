import type {} from './deno.d.ts';

/* global Deno */
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface DeleteAccountRequest {
  deleteReviews: boolean;
}

interface StorageObject {
  bucket_id: string;
  object_name: string;
}

class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authorization = request.headers.get('Authorization');
    const accessToken = authorization?.replace(/^Bearer\s+/i, '');
    if (!authorization || !accessToken) {
      throw new HttpError('Authentication required', 401);
    }

    const requestBody = (await request.json()) as Partial<DeleteAccountRequest>;
    if (typeof requestBody.deleteReviews !== 'boolean') {
      throw new HttpError('deleteReviews must be a boolean', 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error('Required Supabase environment variables are missing');
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } =
      await userClient.auth.getUser(accessToken);
    if (userError || !userData.user) {
      throw new HttpError('Authentication required', 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: objectsData, error: prepareError } = await adminClient.rpc(
      'prepare_account_deletion',
      {
        p_user_id: userData.user.id,
        p_delete_reviews: requestBody.deleteReviews,
      }
    );
    if (prepareError) {
      throw new Error(`Could not prepare account deletion: ${prepareError.message}`);
    }

    const objects = (objectsData ?? []) as StorageObject[];
    const objectsByBucket = new Map<string, string[]>();
    for (const object of objects) {
      const bucketObjects = objectsByBucket.get(object.bucket_id) ?? [];
      bucketObjects.push(object.object_name);
      objectsByBucket.set(object.bucket_id, bucketObjects);
    }

    for (const [bucketId, objectNames] of objectsByBucket) {
      for (let index = 0; index < objectNames.length; index += 100) {
        const batch = objectNames.slice(index, index + 100);
        const { error: storageError } = await adminClient.storage
          .from(bucketId)
          .remove(batch);
        if (storageError) {
          throw new Error(`Could not remove account storage: ${storageError.message}`);
        }
      }
    }

    const { error: finalizeError } = await adminClient.rpc(
      'finalize_account_deletion',
      {
        p_user_id: userData.user.id,
        p_delete_reviews: requestBody.deleteReviews,
        p_storage_base_url: supabaseUrl,
      }
    );
    if (finalizeError) {
      throw new Error(`Could not finalize account deletion: ${finalizeError.message}`);
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    console.error('Account deletion failed', error);
    return jsonResponse(
      { error: 'Account deletion failed. Please try again.' },
      500
    );
  }
});
