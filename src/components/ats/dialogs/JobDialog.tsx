"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, queryKeys } from "@/lib/ats/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYMENT_TYPES, JOB_STATUSES, PRIORITIES } from "@/lib/ats/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Job } from "@/lib/ats/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.string(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string().default("USD"),
  description: z.string().default(""),
  requirements: z.string().default(""),
  skills: z.string().default(""),
  experienceYears: z.coerce.number().default(0),
  status: z.string().default("draft"),
  priority: z.string().default("medium"),
  remoteOk: z.boolean().default(true),
  openings: z.coerce.number().default(1),
  hiringManager: z.string().default(""),
});

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
}

export function JobDialog({ open, onOpenChange, job }: JobDialogProps) {
  const qc = useQueryClient();
  const isEdit = !!job;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job?.title ?? "",
      department: job?.department ?? "",
      location: job?.location ?? "",
      employmentType: job?.employmentType ?? "Full-time",
      salaryMin: job?.salaryMin ?? undefined,
      salaryMax: job?.salaryMax ?? undefined,
      currency: job?.currency ?? "USD",
      description: job?.description ?? "",
      requirements: job?.requirements.join(", ") ?? "",
      skills: job?.skills.join(", ") ?? "",
      experienceYears: job?.experienceYears ?? 0,
      status: job?.status ?? "draft",
      priority: job?.priority ?? "medium",
      remoteOk: job?.remoteOk ?? true,
      openings: job?.openings ?? 1,
      hiringManager: job?.hiringManager ?? "",
    },
  });

  // Reset when job changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: job?.title ?? "",
        department: job?.department ?? "",
        location: job?.location ?? "",
        employmentType: job?.employmentType ?? "Full-time",
        salaryMin: job?.salaryMin ?? undefined,
        salaryMax: job?.salaryMax ?? undefined,
        currency: job?.currency ?? "USD",
        description: job?.description ?? "",
        requirements: job?.requirements.join(", ") ?? "",
        skills: job?.skills.join(", ") ?? "",
        experienceYears: job?.experienceYears ?? 0,
        status: job?.status ?? "draft",
        priority: job?.priority ?? "medium",
        remoteOk: job?.remoteOk ?? true,
        openings: job?.openings ?? 1,
        hiringManager: job?.hiringManager ?? "",
      });
    }
  }, [open, job, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const payload = {
        ...values,
        requirements: values.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (isEdit && job) {
        return api.updateJob(job.id, payload);
      }
      return api.createJob(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(isEdit ? "Job updated" : "Job created");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit job" : "New job posting"}</DialogTitle>
          <DialogDescription>
            Fill out the form below. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Senior React Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Department *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Engineering" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco, CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hiringManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Hiring Manager</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Priya Venkatesan" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Openings</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Salary Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        placeholder="120000"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Salary Max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        placeholder="180000"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Years Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remoteOk"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs">Remote OK</FormLabel>
                      <FormDescription>Allow remote work for this role</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Skills (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="React, TypeScript, Next.js" />
                  </FormControl>
                  <FormDescription>Used for AI resume scoring</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Requirements (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="5+ years React, deep TypeScript, CI/CD experience"
                      rows={2}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Job description…" />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />}
                {isEdit ? "Save changes" : "Create job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
