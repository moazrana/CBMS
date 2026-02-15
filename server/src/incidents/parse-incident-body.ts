/**
 * Parses multipart form body into incident create/update payload.
 * Handles flat keys like type[0], commentary[severity], and JSON strings.
 */
export function parseIncidentBody(body: Record<string, any>): Record<string, any> {
  const data: Record<string, any> = {};

  const singleKeys = [
    'student',
    'staff',
    'status',
    'location',
    'dateAndTime',
    'description',
    'body_mapping',
    'actionDescription',
    'physicalInterventionUsed',
    'restrainDescription',
    'fileName',
    'filePath',
    'fileType',
    'fileSize',
  ];
  for (const key of singleKeys) {
    if (body[key] !== undefined && body[key] !== '') {
      if (key === 'status') data[key] = body[key] === 'true' || body[key] === '1';
      else if (key === 'body_mapping') data[key] = body[key] === 'true' || body[key] === '1';
      else if (key === 'physicalInterventionUsed') data[key] = body[key] === 'true' || body[key] === '1';
      else if (key === 'fileSize') data[key] = Number(body[key]);
      else data[key] = body[key];
    }
  }

  // Commentary (flat keys commentary[severity] or nested body.commentary)
  const severityRaw =
    body['commentary[severity]'] ?? body.commentary?.severity ?? undefined;
  const directionRaw =
    body['commentary[direction]'] ?? body.commentary?.direction ?? '';
  const behaviorRaw =
    body['commentary[behavior]'] ?? body.commentary?.behavior ?? body.commentary?.behaviour ?? '';
  const severityNum = Number(severityRaw);
  const severity =
    Number.isInteger(severityNum) && severityNum >= 1 && severityNum <= 3
      ? severityNum
      : 1;
  data.commentary = {
    severity,
    direction: String(directionRaw ?? ''),
    behavior: String(behaviorRaw ?? ''),
  };

  // type and your_account: accept JSON string or type[0]/your_account[0] style
  for (const key of ['type', 'your_account']) {
    if (typeof body[key] === 'string') {
      try {
        const parsed = JSON.parse(body[key]);
        if (Array.isArray(parsed)) {
          data[key] = parsed;
        }
      } catch {
        // fall through to indexed form
      }
    }
    if (data[key] === undefined) {
      const arr: string[] = [];
      let i = 0;
      while (body[`${key}[${i}]`] !== undefined) {
        arr.push(body[`${key}[${i}]`]);
        i++;
      }
      if (arr.length) data[key] = arr;
    }
  }
  // early_help, action, exclusion, referral_type: accept JSON string or indexed form
  for (const key of ['early_help', 'action', 'exclusion', 'referral_type']) {
    if (typeof body[key] === 'string') {
      try {
        const parsed = JSON.parse(body[key]);
        if (Array.isArray(parsed)) {
          data[key] = parsed;
        }
      } catch {
        // fall through to indexed form
      }
    }
    if (data[key] === undefined) {
      const arr: string[] = [];
      let i = 0;
      while (body[`${key}[${i}]`] !== undefined) {
        arr.push(body[`${key}[${i}]`]);
        i++;
      }
      if (arr.length) data[key] = arr;
    }
  }

  // JSON string fields
  if (typeof body.directedToward === 'string' && body.directedToward) {
    try {
      data.directedToward = JSON.parse(body.directedToward);
    } catch {
      data.directedToward = [];
    }
  }
  if (typeof body.meetings === 'string' && body.meetings) {
    try {
      data.meetings = JSON.parse(body.meetings);
    } catch {
      data.meetings = [];
    }
  }
  if (typeof body.conclusion === 'string' && body.conclusion) {
    try {
      data.conclusion = JSON.parse(body.conclusion);
    } catch {
      data.conclusion = [];
    }
  }
  if (typeof body.bodyMapFrontMarkers === 'string' && body.bodyMapFrontMarkers) {
    try {
      data.bodyMapFrontMarkers = JSON.parse(body.bodyMapFrontMarkers);
    } catch {
      data.bodyMapFrontMarkers = {};
    }
  }
  if (typeof body.bodyMapBackMarkers === 'string' && body.bodyMapBackMarkers) {
    try {
      data.bodyMapBackMarkers = JSON.parse(body.bodyMapBackMarkers);
    } catch {
      data.bodyMapBackMarkers = {};
    }
  }

  return data;
}
