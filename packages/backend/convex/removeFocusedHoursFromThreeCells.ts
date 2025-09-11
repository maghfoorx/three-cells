import { mutation } from "./_generated/server";

export const removeFocusedHoursFromThreeCells = mutation({
  args: {},
  handler: async (ctx, args) => {
    const allThreeCells = await ctx.db.query("three_cells").collect();

    // Loop through each document
    for (const cell of allThreeCells) {
      // Check if focusedHours exists
      if (cell?.focusedHours != null) {
        // Update the document to remove focusedHours
        await ctx.db.patch(cell._id, { focusedHours: undefined });
      }
    }

    return { success: true, updatedCount: allThreeCells.length };
  },
});
