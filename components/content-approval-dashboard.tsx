"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Image,
  Video,
  Hash,
  Calendar,
  MessageSquare,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  Instagram,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ContentApproval {
  id: number;
  account_id: number;
  account_username: string;
  content_type: "post" | "story" | "reel";
  content_text: string;
  hashtags: string[];
  image_url?: string;
  video_url?: string;
  scheduled_time?: string;
  status: "pending" | "approved" | "rejected" | "posted";
  created_at: string;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
}

export default function ContentApprovalDashboard() {
  const [approvals, setApprovals] = useState<ContentApproval[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedApproval, setSelectedApproval] =
    useState<ContentApproval | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadApprovals();
  }, [selectedStatus, selectedAccount]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedAccount) params.append("account_id", selectedAccount);

      const response = await fetch(
        `/api/instagram/content/approvals?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApprovals(data.approvals || []);
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Genehmigungen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading approvals:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Genehmigungen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    approvalId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/instagram/content/approvals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approval_id: approvalId,
          action,
          rejection_reason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: `Content erfolgreich ${
            action === "approve" ? "genehmigt" : "abgelehnt"
          }`,
        });
        loadApprovals();
        setRejectionReason("");
        setSelectedApproval(null);
      } else {
        const error = await response.json();
        toast({
          title: "Fehler",
          description: error.error || "Fehler bei der Verarbeitung",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      toast({
        title: "Fehler",
        description: "Fehler bei der Verarbeitung",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "posted":
        return <Instagram className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400/20 text-yellow-400 border-yellow-400/50";
      case "approved":
        return "bg-green-400/20 text-green-400 border-green-400/50";
      case "rejected":
        return "bg-red-400/20 text-red-400 border-red-400/50";
      case "posted":
        return "bg-blue-400/20 text-blue-400 border-blue-400/50";
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/50";
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <Image className="w-4 h-4" />;
      case "story":
        return <MessageSquare className="w-4 h-4" />;
      case "reel":
        return <Video className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-4xl font-bold text-white mb-2 glitch-text"
          data-text="CONTENT GENEHMIGUNG"
        >
          CONTENT GENEHMIGUNG
        </h1>
        <p className="text-gray-400 text-lg">
          Verwalte und genehmige automatisch generierten Content
        </p>
      </motion.div>

      {/* Filter Controls */}
      <Card className="bg-horror-surface border-horror-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-horror-bg border-horror-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Wartend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="posted">Veröffentlicht</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger className="bg-horror-bg border-horror-border text-white">
                  <SelectValue placeholder="Alle Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Accounts</SelectItem>
                  {/* Accounts würden hier dynamisch geladen */}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={loadApprovals}
              variant="outline"
              className="border-horror-accent text-horror-accent hover:bg-horror-accent hover:text-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Wartend",
            count: approvals.filter((a) => a.status === "pending").length,
            color: "text-yellow-400",
          },
          {
            label: "Genehmigt",
            count: approvals.filter((a) => a.status === "approved").length,
            color: "text-green-400",
          },
          {
            label: "Abgelehnt",
            count: approvals.filter((a) => a.status === "rejected").length,
            color: "text-red-400",
          },
          {
            label: "Veröffentlicht",
            count: approvals.filter((a) => a.status === "posted").length,
            color: "text-blue-400",
          },
        ].map((stat, index) => (
          <Card key={index} className="bg-horror-surface border-horror-border">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {approvals.map((approval) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-horror-surface border-horror-border hover:border-horror-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${getStatusColor(
                              approval.status
                            )} border`}
                          >
                            {getStatusIcon(approval.status)}
                            <span className="ml-1 capitalize">
                              {approval.status}
                            </span>
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {getContentTypeIcon(approval.content_type)}
                            <span className="capitalize">
                              {approval.content_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>@{approval.account_username}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(approval.created_at)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <p className="text-white leading-relaxed">
                          {approval.content_text}
                        </p>

                        {approval.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {approval.hashtags.map((hashtag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-horror-accent/20 text-horror-accent text-xs"
                              >
                                #{hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {approval.scheduled_time && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Geplant für: {formatDate(approval.scheduled_time)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Media Preview */}
                      {(approval.image_url || approval.video_url) && (
                        <div className="bg-horror-bg/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            {approval.image_url && (
                              <Image className="w-4 h-4" />
                            )}
                            {approval.video_url && (
                              <Video className="w-4 h-4" />
                            )}
                            <span>Media angehängt</span>
                          </div>
                          {approval.image_url && (
                            <div className="w-20 h-20 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {approval.status === "rejected" &&
                        approval.rejection_reason && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                              <XCircle className="w-4 h-4" />
                              Ablehnungsgrund:
                            </div>
                            <p className="text-red-300 text-sm">
                              {approval.rejection_reason}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Actions */}
                    {approval.status === "pending" && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => handleApproval(approval.id, "approve")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Genehmigen
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedApproval(approval)}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Ablehnen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-horror-surface border-horror-border">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Content ablehnen
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm text-gray-400 mb-2 block">
                                  Grund für die Ablehnung:
                                </label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                  }
                                  className="bg-horror-bg border-horror-border text-white"
                                  placeholder="Bitte geben Sie einen Grund für die Ablehnung an..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-3 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedApproval(null)}
                                >
                                  Abbrechen
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    selectedApproval &&
                                    handleApproval(
                                      selectedApproval.id,
                                      "reject"
                                    )
                                  }
                                  disabled={!rejectionReason.trim()}
                                >
                                  Content ablehnen
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {approvals.length === 0 && (
          <Card className="bg-horror-surface border-horror-border">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                Keine Content-Genehmigungen gefunden
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedStatus === "pending"
                  ? "Alle generierten Inhalte wurden bereits verarbeitet"
                  : `Keine Inhalte mit Status "${selectedStatus}" gefunden`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
