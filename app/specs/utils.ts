import type { OpenAPIV3 } from "openapi-types";

export function getTokenUrlForScheme(doc: OpenAPIV3.Document, scheme: string) {
  const auth = doc.components?.securitySchemes?.[scheme];

  if (!auth) {
    return;
  }

  if ("$ref" in auth) {
    return;
  }

  if (auth.type !== "oauth2") {
    return;
  }

  if (!auth.flows.authorizationCode) {
    return;
  }

  return new URL(auth.flows.authorizationCode.tokenUrl);
}

export function getAuthorizationUrlForScheme(
  doc: OpenAPIV3.Document,
  scheme: string,
  operationIds: string[]
) {
  const auth = doc.components?.securitySchemes?.[scheme];

  if (!auth) {
    return;
  }

  if ("$ref" in auth) {
    return;
  }

  if (auth.type !== "oauth2") {
    return;
  }

  if (!auth.flows.authorizationCode) {
    return;
  }

  const scopes = operationIds.flatMap((operationId) =>
    getScopesForOperationAndSecurityRequirement(doc, operationId, scheme)
  );

  const uniqueScopes = Array.from(new Set(scopes));

  const url = new URL(auth.flows.authorizationCode.authorizationUrl);
  url.searchParams.set("scope", uniqueScopes.join(" "));
  return url;
}

function getScopesForOperationAndSecurityRequirement(
  doc: OpenAPIV3.Document,
  operationId: string,
  securityRequirement: string
) {
  const operation = findOperationById(doc, operationId);

  if (!operation) {
    return [];
  }

  const security = operation.security?.find(
    (s) => Object.keys(s)[0] === securityRequirement
  );

  if (!security) {
    return [];
  }

  return security[securityRequirement];
}

function findOperationById(
  doc: OpenAPIV3.Document,
  operationId: string
): OpenAPIV3.OperationObject | undefined {
  for (const path in doc.paths) {
    const pathObj = doc.paths[path];

    if (!pathObj) {
      continue;
    }

    if ("get" in pathObj) {
      const operation = pathObj.get;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }

    if ("post" in pathObj) {
      const operation = pathObj.post;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }

    if ("put" in pathObj) {
      const operation = pathObj.put;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }

    if ("delete" in pathObj) {
      const operation = pathObj.delete;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }

    if ("patch" in pathObj) {
      const operation = pathObj.patch;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }

    if ("head" in pathObj) {
      const operation = pathObj.head;
      if (operation?.operationId === operationId) {
        return operation;
      }
    }
  }
}
