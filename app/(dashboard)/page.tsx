"use client";

import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ContactsApi, type Contact } from "@/lib/client/api";
import { useAuth } from "@/lib/client/useAuth";
import { useMemo } from "react";

const RECENT_CONTACTS_LIMIT = 5;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => ContactsApi.list(0, 1000),
  });

  const contacts = useMemo(() => data?.data || [], [data?.data]);
  const totalCount = contacts.length;

  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, RECENT_CONTACTS_LIMIT);
  }, [contacts]);

  return (
    <Box>
      <Stack gap={6}>
        <Box>
          <Heading size="xl">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ""}!
          </Heading>
          <Text color="gray.600" mt={2}>
            Manage your contacts and settings from this dashboard.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Total Contacts Stat Card */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>
              Total Contacts
            </Text>
            {isLoading ? (
              <Skeleton height="36px" width="80px" />
            ) : (
              <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                {totalCount}
              </Text>
            )}
            <Text fontSize="sm" color="gray.500" mt={1}>
              in your CRM
            </Text>
          </Box>

          {/* Quick Stats Card */}
          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>
              Recent Activity
            </Text>
            {isLoading ? (
              <Skeleton height="36px" width="120px" />
            ) : (
              <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                {recentContacts.length > 0
                  ? formatDate(recentContacts[0]?.createdAt)
                  : "No activity"}
              </Text>
            )}
            <Text fontSize="sm" color="gray.500" mt={1}>
              last contact added
            </Text>
          </Box>
        </SimpleGrid>

        {/* Recent Contacts List */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            Recent Contacts
          </Heading>
          {isLoading ? (
            <Stack gap={3}>
              {Array.from({ length: RECENT_CONTACTS_LIMIT }).map((_, i) => (
                <Box key={i} p={3} bg="gray.50" borderRadius="md">
                  <Skeleton height="20px" width="60%" mb={2} />
                  <Skeleton height="16px" width="40%" />
                </Box>
              ))}
            </Stack>
          ) : recentContacts.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              No contacts yet. Add your first contact from the Contacts page!
            </Text>
          ) : (
            <Stack gap={3}>
              {recentContacts.map((contact: Contact) => (
                <Flex
                  key={contact.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                >
                  <Box>
                    <Text fontWeight="medium">{contact.organisation}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {contact.description || "No description"}
                    </Text>
                  </Box>
                  <Text fontSize="sm" color="gray.400">
                    {formatDate(contact.createdAt)}
                  </Text>
                </Flex>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
