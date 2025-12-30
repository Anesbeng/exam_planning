<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Module;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's log what we're about to do
        echo "\n🔄 Starting conversion of teacher names to matricules...\n";
        
        // Get all modules
        $modules = Module::all();
        
        echo "📊 Found {$modules->count()} modules to process.\n\n";
        
        $converted = 0;
        $notFound = 0;
        $alreadyMatricule = 0;
        
        foreach ($modules as $module) {
            $teacherResponsible = $module->teacher_responsible;
            
            // Skip if empty
            if (empty($teacherResponsible)) {
                continue;
            }
            
            // Check if it's already a matricule (usually starts with specific pattern)
            // Adjust this logic based on your matricule format
            if ($this->looksLikeMatricule($teacherResponsible)) {
                $alreadyMatricule++;
                echo "ℹ️  Module '{$module->name}' already uses matricule: {$teacherResponsible}\n";
                continue;
            }
            
            // Find teacher by name
            $teacher = User::where('name', $teacherResponsible)
                          ->where('role', 'teacher')
                          ->first();
            
            if ($teacher && $teacher->matricule) {
                // Update to use matricule
                $oldValue = $module->teacher_responsible;
                $module->teacher_responsible = $teacher->matricule;
                $module->save();
                
                $converted++;
                echo "✅ Module '{$module->name}': '{$oldValue}' → '{$teacher->matricule}'\n";
                
                // Also log to Laravel log
                Log::info("Module conversion: {$module->name} - {$oldValue} → {$teacher->matricule}");
            } else {
                $notFound++;
                echo "❌ Module '{$module->name}': Teacher '{$teacherResponsible}' not found!\n";
                Log::warning("Module '{$module->name}': Teacher '{$teacherResponsible}' not found!");
            }
        }
        
        // Summary
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "📈 CONVERSION SUMMARY\n";
        echo str_repeat("=", 50) . "\n";
        echo "Total modules: {$modules->count()}\n";
        echo "✅ Successfully converted: {$converted}\n";
        echo "ℹ️  Already using matricule: {$alreadyMatricule}\n";
        echo "❌ Not found (need manual fix): {$notFound}\n";
        echo str_repeat("=", 50) . "\n\n";
        
        Log::info("Module conversion completed: {$converted} converted, {$alreadyMatricule} already correct, {$notFound} not found");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "\n🔄 Reverting matricules back to teacher names...\n\n";
        
        // Get all modules
        $modules = Module::all();
        
        $reverted = 0;
        $notFound = 0;
        
        foreach ($modules as $module) {
            $teacherMatricule = $module->teacher_responsible;
            
            // Skip if empty
            if (empty($teacherMatricule)) {
                continue;
            }
            
            // Find teacher by matricule
            $teacher = User::where('matricule', $teacherMatricule)
                          ->where('role', 'teacher')
                          ->first();
            
            if ($teacher) {
                // Revert to name
                $module->teacher_responsible = $teacher->name;
                $module->save();
                
                $reverted++;
                echo "✅ Module '{$module->name}': '{$teacherMatricule}' → '{$teacher->name}'\n";
            } else {
                $notFound++;
                echo "❌ Module '{$module->name}': Teacher with matricule '{$teacherMatricule}' not found!\n";
            }
        }
        
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "📈 REVERT SUMMARY\n";
        echo str_repeat("=", 50) . "\n";
        echo "✅ Successfully reverted: {$reverted}\n";
        echo "❌ Not found: {$notFound}\n";
        echo str_repeat("=", 50) . "\n\n";
    }
    
    /**
     * Check if the value looks like a matricule
     * Adjust this based on your matricule format
     */
    private function looksLikeMatricule(string $value): bool
    {
        // Example patterns - adjust based on your actual matricule format:
        // - Starts with 'T' followed by numbers: T12345
        // - Only numbers: 12345
        // - Pattern like: MAT-12345
        
        // Simple check: if it contains only uppercase letters and numbers
        // and is relatively short (matricules are usually short codes)
        if (strlen($value) < 15 && preg_match('/^[A-Z0-9\-]+$/', $value)) {
            return true;
        }
        
        // If it doesn't contain spaces and is not a typical name format
        if (!str_contains($value, ' ') && strlen($value) < 10) {
            return true;
        }
        
        return false;
    }
};