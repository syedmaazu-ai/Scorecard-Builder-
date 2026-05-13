import { ChevronDown, Bot, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  mockAuditors,
  mockReviewers,
  mockBots,
  type ScorecardFormData,
  type BotType,
  type QAType,
} from "@/data/mockData";

interface Props {
  formData: ScorecardFormData;
  updateFormData: <K extends keyof ScorecardFormData>(field: K, value: ScorecardFormData[K]) => void;
  expanded: boolean;
  onToggle: () => void;
}

export function BotGeneralAccordion({ formData, updateFormData, expanded, onToggle }: Props) {
  const showAuditor = formData.qaType === "manual" || formData.qaType === "hybrid";
  const showReviewer = formData.qaType === "auto";
  const filteredBots = mockBots.filter((b) => b.type === formData.botType);

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50">
        <div>
          <h3 className="font-medium text-foreground">General Settings</h3>
          <p className="text-sm text-muted-foreground">Name, bot selection and QA type</p>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-5 rounded-b-lg border border-t-0 bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="bot-scorecard-name">Scorecard Name</Label>
            <Input
              id="bot-scorecard-name"
              placeholder="Enter scorecard name..."
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bot-scorecard-desc">Description</Label>
            <Textarea
              id="bot-scorecard-desc"
              placeholder="Briefly describe what this scorecard audits..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Bot Type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { value: "chatbot", label: "Chatbot", icon: Bot },
                { value: "voicebot", label: "Voice bot", icon: Mic },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = formData.botType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      updateFormData("botType", opt.value as BotType);
                      updateFormData("botIds", []);
                      updateFormData("ticketCategory", opt.value === "voicebot" ? "voice" : "non-voice");
                      updateFormData("ticketType", opt.value === "voicebot" ? "voice" : "chat");
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                      active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label>Select Bots</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {formData.botIds.length === 0 ? (
                    <span className="text-muted-foreground">{`Choose ${formData.botType === "voicebot" ? "voice bots" : "chatbots"}...`}</span>
                  ) : (
                    formData.botIds.map((id) => {
                      const bot = mockBots.find((b) => b.id === id);
                      if (!bot) return null;
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {bot.name}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateFormData("botIds", formData.botIds.filter((x) => x !== id));
                            }}
                            className="ml-1 rounded-sm hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      );
                    })
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                {filteredBots.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No bots available</p>
                ) : (
                  filteredBots.map((b) => {
                    const checked = formData.botIds.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            if (v) updateFormData("botIds", [...formData.botIds, b.id]);
                            else updateFormData("botIds", formData.botIds.filter((x) => x !== b.id));
                          }}
                        />
                        <span>{b.name}</span>
                      </label>
                    );
                  })
                )}
              </PopoverContent>
            </Popover>
          </div>

          {formData.botIds.length > 0 && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label>QA Type</Label>
                <ToggleGroup
                  type="single"
                  value={formData.qaType}
                  onValueChange={(value) => {
                    if (!value) return;
                    updateFormData("qaType", value as QAType);
                    if (value === "auto") updateFormData("auditors", []);
                    else updateFormData("reviewer", "");
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="manual" className="px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Manual</ToggleGroupItem>
                  <ToggleGroupItem value="hybrid" className="px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Hybrid</ToggleGroupItem>
                  <ToggleGroupItem value="auto" className="px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Auto</ToggleGroupItem>
                </ToggleGroup>
              </div>

              {showAuditor && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label>Auditor</Label>
                  <Select value={formData.auditors[0] || ""} onValueChange={(v) => updateFormData("auditors", [v])}>
                    <SelectTrigger><SelectValue placeholder="Select auditor..." /></SelectTrigger>
                    <SelectContent>
                      {mockAuditors.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showReviewer && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label>Reviewer</Label>
                  <Select value={formData.reviewer} onValueChange={(v) => updateFormData("reviewer", v)}>
                    <SelectTrigger><SelectValue placeholder="Select reviewer..." /></SelectTrigger>
                    <SelectContent>
                      {mockReviewers.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
