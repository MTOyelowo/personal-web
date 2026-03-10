"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// ── Types ───────────────────────────────────────────────────

export interface AboutSkill {
  id: string;
  label: string;
  items: string[];
  order: number;
}

export interface AboutContentData {
  id: string;
  firstName: string;
  lastName: string;
  subtitle: string;
  bio: string;
  poemLines: string[];
  cvUrl: string | null;
  cvBlobPath: string | null;
  skills: AboutSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectGithubLink {
  label: string;
  href: string;
}

export interface ProjectTechItem {
  label: string;
  icon: string;
}

export interface ProjectImageData {
  id: string;
  projectId: string;
  url: string;
  blobPath: string;
  alt: string;
  order: number;
  createdAt: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  liveUrl: string;
  githubLinks: ProjectGithubLink[];
  techStack: ProjectTechItem[];
  contributor: boolean;
  order: number;
  images: ProjectImageData[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperienceData {
  id: string;
  company: string;
  position: string;
  dateRange: string;
  descriptions: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AboutInfoItemData {
  id: string;
  label: string;
  value: string;
  href: string | null;
  iconKey: string;
  order: number;
}

export interface SocialLinkData {
  id: string;
  platform: string;
  href: string;
  iconKey: string;
  order: number;
}

// ── About Content (singleton) ───────────────────────────────

export const useAboutContent = () => {
  return useQuery({
    queryKey: ["about", "content"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: AboutContentData;
      }>("/api/about");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateAboutContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Partial<
        Omit<AboutContentData, "id" | "createdAt" | "updatedAt" | "skills">
      > & {
        skills?: Array<{ label: string; items: string[] }>;
      },
    ) => {
      const res = await axios.put("/api/about", data);
      return res.data.data as AboutContentData;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "content"] }),
  });
};

// ── CV Upload ───────────────────────────────────────────────

export const useUploadCv = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await axios.post("/api/about/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data as { cvUrl: string; cvBlobPath: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "content"] }),
  });
};

// ── Projects ────────────────────────────────────────────────

export const useProjects = () => {
  return useQuery({
    queryKey: ["about", "projects"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: ProjectData[];
      }>("/api/about/projects");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<ProjectData, "id" | "createdAt" | "updatedAt">,
    ) => {
      const res = await axios.post("/api/about/projects", data);
      return res.data.data as ProjectData;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "projects"] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Omit<ProjectData, "createdAt" | "updatedAt">> & {
      id: string;
    }) => {
      const res = await axios.patch(`/api/about/projects/${id}`, data);
      return res.data.data as ProjectData;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "projects"] }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/about/projects/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "projects"] }),
  });
};

// ── Project Images ──────────────────────────────────────────

export const useUploadProjectImage = () => {
  return useMutation({
    mutationFn: async ({
      projectId,
      file,
      alt,
      order,
    }: {
      projectId: string;
      file: File;
      alt?: string;
      order?: number;
    }) => {
      const formData = new FormData();
      formData.append("image", file);
      if (alt) formData.append("alt", alt);
      if (order !== undefined) formData.append("order", String(order));
      const res = await axios.post(
        `/api/about/projects/${projectId}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data as ProjectImageData;
    },
    onSuccess: () => {},
  });
};

export const useDeleteProjectImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      imageId,
    }: {
      projectId: string;
      imageId: string;
    }) => {
      await axios.delete(`/api/about/projects/${projectId}/images`, {
        data: { imageId },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "projects"] }),
  });
};

export const useReorderProjectImages = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      images,
    }: {
      projectId: string;
      images: { id: string; order: number; alt?: string }[];
    }) => {
      const res = await axios.patch(`/api/about/projects/${projectId}/images`, {
        images,
      });
      return res.data.data as ProjectImageData[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about", "projects"] }),
  });
};

// ── Work Experiences ────────────────────────────────────────

export const useWorkExperiences = () => {
  return useQuery({
    queryKey: ["about", "work-experiences"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: WorkExperienceData[];
      }>("/api/about/work-experiences");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateWorkExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<WorkExperienceData, "id" | "createdAt" | "updatedAt">,
    ) => {
      const res = await axios.post("/api/about/work-experiences", data);
      return res.data.data as WorkExperienceData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "work-experiences"] }),
  });
};

export const useUpdateWorkExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Omit<WorkExperienceData, "createdAt" | "updatedAt">> & {
      id: string;
    }) => {
      const res = await axios.patch(`/api/about/work-experiences/${id}`, data);
      return res.data.data as WorkExperienceData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "work-experiences"] }),
  });
};

export const useDeleteWorkExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/about/work-experiences/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "work-experiences"] }),
  });
};

// ── About Info Items ────────────────────────────────────────

export const useAboutInfoItems = () => {
  return useQuery({
    queryKey: ["about", "info-items"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: AboutInfoItemData[];
      }>("/api/about/info-items");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAboutInfoItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<AboutInfoItemData, "id" | "createdAt" | "updatedAt">,
    ) => {
      const res = await axios.post("/api/about/info-items", data);
      return res.data.data as AboutInfoItemData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "info-items"] }),
  });
};

export const useUpdateAboutInfoItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Omit<AboutInfoItemData, "createdAt" | "updatedAt">> & {
      id: string;
    }) => {
      const res = await axios.patch(`/api/about/info-items/${id}`, data);
      return res.data.data as AboutInfoItemData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "info-items"] }),
  });
};

export const useDeleteAboutInfoItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/about/info-items/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "info-items"] }),
  });
};

// ── Social Links ────────────────────────────────────────────

export const useSocialLinks = () => {
  return useQuery({
    queryKey: ["about", "social-links"],
    queryFn: async () => {
      const res = await axios.get<{
        success: boolean;
        data: SocialLinkData[];
      }>("/api/about/social-links");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<SocialLinkData, "id" | "createdAt" | "updatedAt">,
    ) => {
      const res = await axios.post("/api/about/social-links", data);
      return res.data.data as SocialLinkData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "social-links"] }),
  });
};

export const useUpdateSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Omit<SocialLinkData, "createdAt" | "updatedAt">> & {
      id: string;
    }) => {
      const res = await axios.patch(`/api/about/social-links/${id}`, data);
      return res.data.data as SocialLinkData;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "social-links"] }),
  });
};

export const useDeleteSocialLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/about/social-links/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["about", "social-links"] }),
  });
};
