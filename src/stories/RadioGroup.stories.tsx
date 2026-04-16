import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Single-select option group built on `@base-ui/react` RadioPrimitive. Compose `RadioGroup` with `RadioGroupItem` children. The hover border highlights in the brand accent color (`#e87537`). Use for mutually exclusive choices like tone or channel selection.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" className="w-[250px]">
      <label className="flex items-center gap-2 cursor-pointer">
        <RadioGroupItem value="option-1" />
        <span className="text-sm">Option One</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <RadioGroupItem value="option-2" />
        <span className="text-sm">Option Two</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <RadioGroupItem value="option-3" />
        <span className="text-sm">Option Three</span>
      </label>
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="friendly" className="w-[300px]">
      <label className="flex items-start gap-2 cursor-pointer">
        <RadioGroupItem value="friendly" className="mt-0.5" />
        <div>
          <span className="text-sm font-medium">Friendly</span>
          <p className="text-xs text-muted-foreground">Warm and approachable tone</p>
        </div>
      </label>
      <label className="flex items-start gap-2 cursor-pointer">
        <RadioGroupItem value="professional" className="mt-0.5" />
        <div>
          <span className="text-sm font-medium">Professional</span>
          <p className="text-xs text-muted-foreground">Formal and business-like</p>
        </div>
      </label>
      <label className="flex items-start gap-2 cursor-pointer">
        <RadioGroupItem value="neutral" className="mt-0.5" />
        <div>
          <span className="text-sm font-medium">Neutral</span>
          <p className="text-xs text-muted-foreground">Balanced and informative</p>
        </div>
      </label>
    </RadioGroup>
  ),
};
