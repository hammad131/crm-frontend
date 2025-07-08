import { Box, Button, Select, MenuItem, styled } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";

const StyledToolbar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[100],
}));

const ToolbarButton = styled(Button)(({ theme, active }) => ({
  textTransform: "none",
  minWidth: "40px",
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? theme.palette.primary.light : "transparent",
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.main
      : theme.palette.action.hover,
  },
}));

const ToolbarSelect = styled(Select)(({ theme }) => ({
  minWidth: "80px",
  fontSize: "0.875rem",
  "& .MuiSelect-select": {
    padding: theme.spacing(0.5),
  },
}));

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const fontSizes = [10, 12, 14, 16, 18, 24, 36];

  return (
    <StyledToolbar>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <FormatBoldIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <FormatItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <FormatUnderlinedIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <FormatListBulletedIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <FormatListNumberedIcon />
      </ToolbarButton>
      <ToolbarSelect
        value={editor.isActive("paragraph") ? 12 : editor.getAttributes("heading")?.level || 12}
        onChange={(e) => {
          const size = parseInt(e.target.value);
          if (size <= 14) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: size === 24 ? 2 : 3 }).run();
        }}
        displayEmpty
      >
        {fontSizes.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </ToolbarSelect>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <FormatAlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <FormatAlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <FormatAlignRightIcon />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <FormatAlignJustifyIcon />
      </ToolbarButton>
    </StyledToolbar>
  );
};

export default Toolbar;