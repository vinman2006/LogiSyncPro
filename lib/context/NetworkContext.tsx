'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { NodeEntity, ShipmentEntity } from '@/lib/db/repo';

interface NetworkContextType {
  currentNode: NodeEntity | null;
  setCurrentNode: (node: NodeEntity | null) => void;
  isLoadingNode: boolean;
  switchDemoRole: (role: 'DISTRIBUTOR' | 'COLLECTOR' | 'FARMER') => Promise<void>;
  notifications: any[];
  unreadCount: number;
  markAllNotificationsRead: () => Promise<void>;
  refreshShipments: () => Promise<void>;
  shipments: ShipmentEntity[];
  stats: {
    active: number;
    incoming: number;
    inTransit: number;
    pendingPayment: number;
    completed: number;
  };
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentNode, setCurrentNode] = useState<NodeEntity | null>(null);
  const [isLoadingNode, setIsLoadingNode] = useState(true);
  const [shipments, setShipments] = useState<ShipmentEntity[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch or sync user's node
  const fetchUserNode = useCallback(async () => {
    try {
      const uid = user?.uid || (typeof window !== 'undefined' ? localStorage.getItem('logisync_demo_role_uid') : null);
      if (uid) {
        const res = await fetch(`/api/nodes?firebaseUid=${encodeURIComponent(uid)}`);
        const data = await res.json();
        if (data.success && data.node) {
          setCurrentNode(data.node);
          return;
        }
      }

      // Default to Distributor demo node if no node found yet
      const allNodesRes = await fetch('/api/nodes');
      const allNodesData = await allNodesRes.json();
      if (allNodesData.success && allNodesData.nodes?.length > 0) {
        const distNode = allNodesData.nodes.find((n: NodeEntity) => n.role === 'DISTRIBUTOR') || allNodesData.nodes[0];
        setCurrentNode(distNode);
      }
    } catch (err) {
      console.error('Error fetching user node:', err);
    } finally {
      setIsLoadingNode(false);
    }
  }, [user]);

  // Fetch shipments
  const refreshShipments = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments');
      const data = await res.json();
      if (data.success && data.shipments) {
        setShipments(data.shipments);
      }
    } catch (err) {
      console.error('Error loading shipments:', err);
    }
  }, []);

  // Poll notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      // Ignore polling errors
    }
  }, []);

  useEffect(() => {
    fetchUserNode();
    refreshShipments();
    fetchNotifications();

    // Fast polling for realtime multi-browser synchronization (every 3 seconds)
    const interval = setInterval(() => {
      refreshShipments();
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchUserNode, refreshShipments, fetchNotifications]);

  // Demo role switcher for pitching & rapid testing
  const switchDemoRole = useCallback(async (role: 'DISTRIBUTOR' | 'COLLECTOR' | 'FARMER') => {
    try {
      const allNodesRes = await fetch('/api/nodes');
      const allNodesData = await allNodesRes.json();
      if (allNodesData.success && allNodesData.nodes) {
        const target = allNodesData.nodes.find((n: NodeEntity) => n.role === role);
        if (target) {
          setCurrentNode(target);
          if (typeof window !== 'undefined') {
            localStorage.setItem('logisync_demo_role_uid', target.owner_id || `demo-${role.toLowerCase()}-uid`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  // Calculate dynamic stats
  const unreadCount = notifications.filter((n) => !n.read).length;

  const relevantShipments = shipments.filter((s) => {
    if (!currentNode) return true;
    if (currentNode.role === 'DISTRIBUTOR') return s.distributor_node_id === currentNode.id;
    if (currentNode.role === 'COLLECTOR') return s.collector_node_id === currentNode.id;
    if (currentNode.role === 'FARMER') return s.farmer_node_id === currentNode.id;
    return true;
  });

  const stats = {
    active: relevantShipments.filter((s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED' && s.status !== 'REJECTED').length,
    incoming: shipments.filter((s) => s.status === 'REQUESTED' && (currentNode?.role !== 'DISTRIBUTOR' || s.collector_node_id === currentNode?.id)).length,
    inTransit: relevantShipments.filter((s) => s.status === 'IN_TRANSIT').length,
    pendingPayment: relevantShipments.filter((s) => s.status === 'PAYMENT_PENDING' || s.status === 'ARRIVED').length,
    completed: relevantShipments.filter((s) => s.status === 'COMPLETED').length,
  };

  return (
    <NetworkContext.Provider
      value={{
        currentNode,
        setCurrentNode,
        isLoadingNode,
        switchDemoRole,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        refreshShipments,
        shipments,
        stats,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
