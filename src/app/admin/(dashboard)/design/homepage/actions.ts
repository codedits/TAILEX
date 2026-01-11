"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { HomepageSection } from "@/lib/types";

export async function updateHomepageLayout(sections: HomepageSection[]) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from("site_config")
        .upsert({ key: "homepage_layout", value: sections });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/design/homepage");
    return { success: true };
}
