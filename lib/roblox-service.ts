import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

interface GroupMembership {
  path: string;
  user: string;
  role: string;
}

interface GroupRole {
  id: number;
  rank: number;
  name: string;
  memberCount?: number;
}

interface GroupRolesResponse {
  groupId: number;
  roles: GroupRole[];
}

export class RobloxService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Roblox API error: ${response.status}`, errorText);
      throw new Error(
        `Roblox API error ${response.status}: ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  async getMembership(
    groupId: string,
    userId: string
  ): Promise<GroupMembership | null> {
    try {
      const url = `${config.robloxApi.cloudBase}/cloud/v2/groups/${groupId}/memberships?filter=user=='users/${userId}'&maxPageSize=1`;
      const data = await this.request<{
        groupMemberships: GroupMembership[];
      }>(url);

      return data.groupMemberships?.[0] ?? null;
    } catch (error) {
      logger.error('Failed to get membership', error);
      return null;
    }
  }

  async getRolesMap(groupId: string): Promise<Record<number, number>> {
    const url = `${config.robloxApi.groupsBase}/v1/groups/${groupId}/roles`;
    const data = await this.request<GroupRolesResponse>(url);

    const rolesMap: Record<number, number> = {};
    for (const role of data.roles) {
      rolesMap[role.rank] = role.id;
    }
    return rolesMap;
  }

  async promoteUser(
    groupId: string,
    membershipId: string,
    targetRank: number
  ): Promise<void> {
    const rolesMap = await this.getRolesMap(groupId);
    const roleId = rolesMap[targetRank];

    if (!roleId) {
      throw new Error(`No role found for rank ${targetRank} in group ${groupId}`);
    }

    const url = `${config.robloxApi.cloudBase}/cloud/v2/groups/${groupId}/memberships/${membershipId}`;
    await this.request(url, {
      method: 'PATCH',
      body: JSON.stringify({
        role: `groups/${groupId}/roles/${roleId}`,
      }),
    });

    logger.info(
      `Promoted membership ${membershipId} to rank ${targetRank} in group ${groupId}`
    );
  }
}
