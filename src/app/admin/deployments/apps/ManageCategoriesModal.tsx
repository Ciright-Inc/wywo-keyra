"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  deleteAppCategoryMessage,
  deleteAppCategoryWithReassignMessage,
} from "@/lib/admin/adminDeleteMessages";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import {
  DEPLOYMENT_APP_CATEGORY_MAX_LENGTH,
  normalizeDeploymentAppCategory,
  type DeploymentAppCategoryView,
} from "@/lib/deploymentAppConstants";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: DeploymentAppCategoryView[];
  selectedCategory: string;
  onCategoriesChange: (categories: DeploymentAppCategoryView[], selectedCategory?: string) => void;
};

type FieldErrors = {
  orderNumber?: string;
  categoryName?: string;
  reassign?: string;
};

function sortCategories(categories: DeploymentAppCategoryView[]): DeploymentAppCategoryView[] {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function fieldClass(hasError: boolean): string {
  return [
    "mt-1 h-10 w-full rounded-xl border bg-keyra-surface px-3 text-sm text-keyra-primary outline-none focus-visible:keyra-focus",
    hasError ? "border-red-300 ring-1 ring-red-200" : "border-keyra-border",
  ].join(" ");
}

export function ManageCategoriesModal({
  open,
  onClose,
  categories,
  selectedCategory,
  onCategoriesChange,
}: Props) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [categoryList, setCategoryList] = useState(() => sortCategories(categories));
  const [orderNumber, setOrderNumber] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingOriginalName, setEditingOriginalName] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [reassignFor, setReassignFor] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setCategoryList(sortCategories(categories));
    resetForm();
    setFieldErrors({});
    setReassignFor(null);
    setReassignTarget("");
  }, [open, categories]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const reassignOptions = useMemo(
    () => (reassignFor ? categoryList.filter((item) => item.name !== reassignFor) : []),
    [categoryList, reassignFor],
  );

  function resetForm() {
    setOrderNumber("");
    setCategoryName("");
    setEditingOriginalName(null);
    setFieldErrors({});
  }

  function startEdit(category: DeploymentAppCategoryView) {
    setEditingOriginalName(category.name);
    setOrderNumber(String(category.sortOrder));
    setCategoryName(category.name);
    setFieldErrors({});
    setReassignFor(null);
  }

  function validateForm(): { order: number; name: string } | null {
    const errors: FieldErrors = {};
    const normalized = normalizeDeploymentAppCategory(categoryName);

    if (orderNumber.trim() === "") {
      errors.orderNumber = "Order number is required.";
    }

    const parsedOrder = Number(orderNumber);
    if (orderNumber.trim() !== "" && (!Number.isFinite(parsedOrder) || parsedOrder < 0 || parsedOrder > 9999)) {
      errors.orderNumber = "Order number must be between 0 and 9999.";
    }

    if (!normalized) {
      errors.categoryName = "Category name is required.";
    } else if (normalized.length > DEPLOYMENT_APP_CATEGORY_MAX_LENGTH) {
      errors.categoryName = `Category name must be at most ${DEPLOYMENT_APP_CATEGORY_MAX_LENGTH} characters.`;
    }

    if (!errors.orderNumber && orderNumber.trim() !== "") {
      const roundedOrder = Math.trunc(parsedOrder);
      const duplicateOrder = categoryList.some(
        (item) => item.sortOrder === roundedOrder && item.name !== editingOriginalName,
      );
      if (duplicateOrder) {
        errors.orderNumber = "This order number is already used.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !normalized || orderNumber.trim() === "") {
      return null;
    }

    return { order: Math.trunc(parsedOrder), name: normalized };
  }

  async function saveCategory() {
    const validated = validateForm();
    if (!validated) return;

    setBusyAction(editingOriginalName ? `save:${editingOriginalName}` : "add");
    setFieldErrors({});

    try {
      const res = await fetch("/api/admin/deployments/apps/categories", {
        method: editingOriginalName ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          editingOriginalName
            ? { originalName: editingOriginalName, name: validated.name, sortOrder: validated.order }
            : { name: validated.name, sortOrder: validated.order },
        ),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        category?: DeploymentAppCategoryView;
      } | null;

      if (!res.ok || !data?.category) {
        const message = data?.error ?? "Unable to save category.";
        if (message.toLowerCase().includes("order number")) {
          setFieldErrors({ orderNumber: message });
        } else if (message.toLowerCase().includes("name")) {
          setFieldErrors({ categoryName: message });
        } else {
          setFieldErrors({ categoryName: message });
        }
        return;
      }

      const saved = data.category;
      const nextSelected =
        selectedCategory === editingOriginalName ? saved.name : selectedCategory || saved.name;

      setCategoryList((current) => {
        const withoutOld = editingOriginalName
          ? current.filter((item) => item.name !== editingOriginalName)
          : current;
        const withoutDuplicate = withoutOld.filter((item) => item.name !== saved.name);
        return sortCategories([...withoutDuplicate, saved]);
      });

      onCategoriesChange(
        sortCategories(
          editingOriginalName
            ? categories
                .filter((item) => item.name !== editingOriginalName)
                .concat(saved)
                .filter((item, index, list) => list.findIndex((entry) => entry.name === item.name) === index)
            : categories.some((item) => item.name === saved.name)
              ? categories.map((item) => (item.name === saved.name ? saved : item))
              : [...categories, saved],
        ),
        nextSelected,
      );

      const wasEditing = editingOriginalName;
      resetForm();
      showAdminActionToast(
        toast,
        wasEditing ? "saved" : "created",
        "app-category",
        { name: saved.name },
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteCategory(name: string, reassignTo?: string) {
    setBusyAction(`delete:${name}`);
    setFieldErrors({});

    try {
      const res = await fetch("/api/admin/deployments/apps/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, reassignTo }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        needsReassign?: boolean;
      } | null;

      if (res.status === 409 && data?.needsReassign) {
        setReassignFor(name);
        const targets = categoryList.filter((item) => item.name !== name);
        setReassignTarget(targets[0]?.name ?? "");
        setFieldErrors({ reassign: data.error ?? "Choose a category to move existing apps to." });
        return;
      }

      if (!res.ok) {
        setFieldErrors({ reassign: data?.error ?? "Unable to delete category." });
        return;
      }

      const nextCategories = sortCategories(categoryList.filter((item) => item.name !== name));
      setCategoryList(nextCategories);
      onCategoriesChange(
        nextCategories,
        selectedCategory === name ? nextCategories[0]?.name ?? "" : selectedCategory,
      );

      if (editingOriginalName === name) resetForm();
      if (reassignFor === name) {
        setReassignFor(null);
        setReassignTarget("");
      }
      showAdminActionToast(toast, "deleted", "app-category", { name });
    } finally {
      setBusyAction(null);
    }
  }

  async function beginDeleteCategory(name: string) {
    if (!(await confirm(deleteAppCategoryMessage(name)))) return;
    await deleteCategory(name);
  }

  async function confirmReassignAndDelete() {
    if (!reassignFor || !reassignTarget) {
      setFieldErrors({ reassign: "Choose a category to move apps to." });
      return;
    }
    if (!(await confirm(deleteAppCategoryWithReassignMessage(reassignFor, reassignTarget)))) return;
    await deleteCategory(reassignFor, reassignTarget);
  }

  const isSaving = busyAction === "add" || busyAction?.startsWith("save:");

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close dialog backdrop"
            className="absolute inset-0 bg-black/55"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Manage categories"
            className="relative flex max-h-[min(calc(100vh-6rem),760px)] w-[min(94vw,640px)] flex-col overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] text-[var(--ds-ink)] shadow-[var(--ds-shadow-soft)] sm:max-h-[min(calc(100vh-7rem),760px)]"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--ds-hairline-strong)] px-5 py-4">
                <div className="min-w-0">
                  <p className="ds-title-md">Manage categories</p>
                  <p className="mt-2 ds-body-sm">
                    Set order numbers and names. Categories appear in the dropdown sorted by order.
                  </p>
                </div>
                <button
                  type="button"
                  className="ds-btn-icon -mr-2"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <span className="text-[20px] leading-none">×</span>
                </button>
              </div>

              <div className="shrink-0 border-b border-[var(--ds-hairline-strong)] px-5 py-3">
                <p className="text-sm font-medium text-keyra-primary">
                  {editingOriginalName ? "Edit category" : "Add new category"}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                    <div>
                      <label className="block text-sm font-medium text-keyra-text-2" htmlFor="category-order-no">
                        Order no. <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="category-order-no"
                        type="number"
                        min={0}
                        max={9999}
                        required
                        className={fieldClass(Boolean(fieldErrors.orderNumber))}
                        placeholder="10"
                        value={orderNumber}
                        onChange={(event) => {
                          setOrderNumber(event.target.value);
                          if (fieldErrors.orderNumber) {
                            setFieldErrors((current) => ({ ...current, orderNumber: undefined }));
                          }
                        }}
                      />
                      {fieldErrors.orderNumber ? (
                        <p className="mt-1.5 text-xs text-red-600">{fieldErrors.orderNumber}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-keyra-text-2" htmlFor="category-name">
                        Category name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="category-name"
                        required
                        className={`${fieldClass(Boolean(fieldErrors.categoryName))} px-4`}
                        placeholder="Example: Finance"
                        value={categoryName}
                        onChange={(event) => {
                          setCategoryName(event.target.value);
                          if (fieldErrors.categoryName) {
                            setFieldErrors((current) => ({ ...current, categoryName: undefined }));
                          }
                        }}
                        maxLength={DEPLOYMENT_APP_CATEGORY_MAX_LENGTH}
                      />
                      {fieldErrors.categoryName ? (
                        <p className="mt-1.5 text-xs text-red-600">{fieldErrors.categoryName}</p>
                      ) : null}
                    </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void saveCategory()}
                      disabled={isSaving}
                      className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)] disabled:opacity-60"
                    >
                      {isSaving ? "Saving…" : editingOriginalName ? "Save changes" : "Add category"}
                    </button>
                    {editingOriginalName ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-keyra-border bg-keyra-surface px-4 py-2 text-sm font-medium text-keyra-primary"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
                <p className="text-sm font-medium text-keyra-primary">Existing categories</p>
                <p className="mt-1 text-xs leading-5 text-keyra-text-2">
                  Lower order numbers appear first in the category dropdown. Each order number must be unique.
                </p>
                <ul className="mt-2 space-y-1.5">
                  {categoryList.map((category) => (
                    <li
                      key={category.name}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-keyra-border bg-keyra-surface px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-keyra-primary">{category.name}</p>
                        <p className="text-xs text-keyra-text-2">Order {category.sortOrder}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => startEdit(category)}
                          className="inline-flex size-8 items-center justify-center rounded-md border border-keyra-border bg-keyra-bg text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${category.name}`}
                          disabled={busyAction === `delete:${category.name}` || categoryList.length <= 1}
                          onClick={() => void beginDeleteCategory(category.name)}
                          className="inline-flex size-8 items-center justify-center rounded-md border border-keyra-border bg-keyra-bg text-red-700 transition hover:border-red-500/30 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {reassignFor ? (
                <div className="shrink-0 border-t border-[var(--ds-hairline-strong)] px-5 py-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-950">
                      Move apps from &ldquo;{reassignFor}&rdquo; to:
                    </p>
                    <select
                      value={reassignTarget}
                      onChange={(event) => {
                        setReassignTarget(event.target.value);
                        if (fieldErrors.reassign) {
                          setFieldErrors((current) => ({ ...current, reassign: undefined }));
                        }
                      }}
                      className="mt-2 h-10 w-full rounded-xl border border-keyra-border bg-white px-3 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
                    >
                      {reassignOptions.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.reassign ? (
                      <p className="mt-1.5 text-xs text-red-600">{fieldErrors.reassign}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void confirmReassignAndDelete()}
                        disabled={!reassignTarget || busyAction === `delete:${reassignFor}`}
                        className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)] disabled:opacity-60"
                      >
                        Move apps & delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReassignFor(null);
                          setReassignTarget("");
                          setFieldErrors((current) => ({ ...current, reassign: undefined }));
                        }}
                        className="rounded-full border border-keyra-border bg-white px-4 py-2 text-sm font-medium text-keyra-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
