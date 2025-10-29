#!/usr/bin/env node

/**
 * Feature Scaffolding CLI Script
 *
 * Initializes a new feature module in src/features/ with the following structure:
 * - api/ - tRPC routers and service layer
 * - components/ - React components
 * - lib/ - Types and validation schemas
 * - pages/ - Page components
 * - header-actions.ts - Header action definitions (optional)
 * - modals.ts - Modal definitions (optional)
 *
 * Usage:
 *   npm run create                              # Interactive mode
 *   npm run create -- my-feature                # Positional argument
 *   npm run create -- --name=my-feature         # Using --name flag
 *   npm run create -- --feature-name=my-feature # Using --feature-name flag
 *   npm run create -- -n my-feature             # Using -n short flag
 *   npm run create -- -f my-feature             # Using -f short flag
 */

import chalk from 'chalk';
import { access, mkdir, writeFile } from 'fs/promises';
import minimist from 'minimist';
import path from 'path';
import prompts from 'prompts';
import { Project, SyntaxKind } from 'ts-morph';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// --- UTILITIES ---

const log = {
	info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
	success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
	warn: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
	error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
	step: (msg) => console.log(`\n${chalk.cyan.bold(`━━━ ${msg}`)}`),
	dim: (msg) => console.log(chalk.dim(`  ${msg}`)),
};

const kebabToPascal = (s) =>
	s.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());

const kebabToCamel = (s) =>
	s.replace(/-\w/g, (c) => c.substring(1).toUpperCase());

const kebabToTitle = (s) =>
	s
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

// --- TEMPLATES ---

/**
 * API Module Templates
 */

const getApiIndexTemplate = (name) => `import { createTRPCRouter } from '@/trpc/server/api/site/trpc';
import { ${kebabToCamel(name)}Router } from './${name}';

/**
 * ${kebabToTitle(name)} Feature Router
 *
 * This is the main router for the ${name} feature.
 * Add additional routers here as the feature grows.
 */
export const ${kebabToCamel(name)}FeatureRouter = createTRPCRouter({
	main: ${kebabToCamel(name)}Router,
});
`;

const getApiModuleTemplate = (name) => `import { createTRPCRouter, protectedProcedure } from '@/trpc/server/api/site/trpc';
import * as z from 'zod';
import * as ${kebabToCamel(name)}Service from './services/${name}.service';

/**
 * ${kebabToTitle(name)} Router
 *
 * Defines tRPC procedures for the ${name} feature.
 * Business logic should be implemented in the service layer.
 */
export const ${kebabToCamel(name)}Router = createTRPCRouter({
	/**
	 * Example procedure
	 * Replace this with your actual procedures
	 */
	getExample: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const result = await ${kebabToCamel(name)}Service.getExample(input.id);
			return result;
		}),
});
`;

const getApiServiceTemplate = (name) => `import tryCatch from '@/lib/core/utils/try-catch';
import { TRPCThrow } from '@/trpc/server/api/site/errors';
import { site } from '@/trpc/server/site';

/**
 * ${kebabToTitle(name)} Service
 *
 * Contains business logic for the ${name} feature.
 * Separates database operations and business rules from tRPC procedures.
 */

/**
 * Example service function
 * Replace this with your actual business logic
 */
export const getExample = async (id: string) => {
	const { data, error } = await tryCatch(
		// Replace with your actual database query
		Promise.resolve({ id, example: 'This is example data' })
	);

	if (error) {
		console.error(
			'getExample: An unexpected error occurred',
			error,
			{ id }
		);
		TRPCThrow.internalError(
			'An unexpected error occurred. Please try again.'
		);
	}

	if (!data) {
		TRPCThrow.notFound('Example not found.');
	}

	return {
		success: true,
		data,
	};
};
`;

/**
 * Component Templates
 */

const getComponentTemplate = (name) => `/**
 * ${kebabToTitle(name)} Component
 *
 * Main component for the ${name} feature.
 */
const ${kebabToPascal(name)}Component = () => {
	return (
		<div>
			<h2>${kebabToTitle(name)} Component</h2>
			<p>Replace this with your component implementation.</p>
		</div>
	);
};

export default ${kebabToPascal(name)}Component;
`;

const getHeaderActionComponentTemplate = (name) => `'use client';

/**
 * ${kebabToTitle(name)} Header Action
 *
 * Displayed in the header when viewing ${name} pages.
 * Customize this to add feature-specific header controls.
 */
const ${kebabToPascal(name)}HeaderAction = () => {
	return (
		<div>
			{/* Implement your header action UI for the ${kebabToTitle(name)} feature here */}
			<p>${kebabToTitle(name)} Header Action</p>
		</div>
	);
};

export default ${kebabToPascal(name)}HeaderAction;
`;

const getModalComponentTemplate = (name) => `'use client';

import ModalLayout from '@/modals/modal-layout';

/**
 * Example ${kebabToTitle(name)} Modal
 *
 * This is a sample modal for the ${name} feature.
 * Customize or create additional modals as needed.
 */
const Example${kebabToPascal(name)}Modal = () => {
	return (
		<ModalLayout
			title='Example ${kebabToTitle(name)} Modal'
			description='This is a sample modal for the ${name} feature.'
			displayImage={{ type: 'icon', iconText: '✨' }}
		>
			<div className='p-4'>
				<p>Modal content goes here.</p>
				<p>Implement your modal UI and logic.</p>
			</div>
		</ModalLayout>
	);
};

export default Example${kebabToPascal(name)}Modal;
`;

/**
 * Lib Templates
 */

const getLibTypesTemplate = (name) => `/**
 * ${kebabToTitle(name)} Feature Types
 *
 * Add your feature-specific TypeScript types and interfaces here.
 */

export interface Example${kebabToPascal(name)}Type {
	id: string;
	name: string;
	// Add your properties
}

// Export all types
export type {};
`;

const getLibValidationTemplate = (name) => `import * as z from 'zod';

/**
 * ${kebabToTitle(name)} Validation Schemas
 *
 * Zod schemas for runtime validation of ${name} feature data.
 * These are used in tRPC procedures and forms.
 */

/**
 * Example validation schema
 * Replace this with your actual validation requirements
 */
export const Example${kebabToPascal(name)}Schema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	description: z.string().optional(),
});

// Type exports
export type Example${kebabToPascal(name)}Input = z.infer<typeof Example${kebabToPascal(name)}Schema>;
`;

/**
 * Pages Templates
 */

const getPagesIndexTemplate = (name) => `/**
 * ${kebabToTitle(name)} Page
 *
 * Main page component for the ${name} feature.
 * Use this for reusable page sections that can be composed into routes.
 */
const ${kebabToPascal(name)}Page = () => {
	return (
		<div>
			<h1>${kebabToTitle(name)}</h1>
			<p>Implement your page content here.</p>
		</div>
	);
};

export default ${kebabToPascal(name)}Page;
`;

/**
 * Header Actions & Modals Templates
 */

const getHeaderActionsTemplate = (name) => `import { lazy } from 'react';
import { createHeaderActionDefinition } from '@/lib/ui/header-actions';

/**
 * ${kebabToTitle(name)} Feature - Header Action Definitions
 *
 * This file defines all header actions related to the ${name} feature.
 * Each header action is created using createHeaderActionDefinition() which provides
 * full type inference for props and automatic route matching.
 */

/**
 * ${kebabToTitle(name)} page header action
 * Displays custom content in the header when viewing ${name} pages
 */
export const ${kebabToCamel(name)}Page = createHeaderActionDefinition({
	Component: lazy(() => import('./components/${name}-header-action')),
	config: {
		// Match any pathname that starts with /${name}
		// Adjust this pattern to match your route structure
		routeMatcher: '/${name}',
	},
});
`;

const getModalsTemplate = (name) => `import { lazy } from 'react';
import { createModalDefinition } from '@/lib/ui/modals';

/**
 * ${kebabToTitle(name)} Feature - Modal Definitions
 *
 * This file defines all modals related to the ${name} feature.
 * Each modal is created using createModalDefinition() which provides
 * full type inference for props.
 */

/**
 * Example ${kebabToTitle(name)} Modal
 *
 * Props: None required (add interface above if you need props)
 * @example
 * const { openModal } = useModals();
 * openModal('example${kebabToPascal(name)}Modal');
 */
export const example${kebabToPascal(name)}Modal = createModalDefinition({
	Component: lazy(() => import('./components/modals/example-${name}-modal')),
	defaultConfig: {
		size: 'md',
		title: '${kebabToTitle(name)} Modal',
		description: 'An example modal for the ${name} feature.',
	},
});
`;

// --- FILE CREATION LOGIC ---

async function createFeature(name, modules) {
	const basePath = path.join(PROJECT_ROOT, 'src', 'features', name);
	log.step(`Scaffolding feature '${name}'`);
	log.dim(`Location: ${basePath}`);

	// Check if feature already exists
	try {
		await access(basePath);
		log.error(`Feature '${name}' already exists. Aborting.`);
		process.exit(1);
	} catch (e) {
		// Directory does not exist, which is good - proceed
	}

	// Create base directory
	await mkdir(basePath, { recursive: true });
	log.success('Created feature directory');

	// Initialize ts-morph project for registry updates
	const project = new Project({
		tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
	});

	const createdFiles = [];
	const updatedFiles = [];

	// Create selected modules
	for (const module of modules) {
		switch (module) {
			case 'api':
				await createApiModule(name, basePath, project, createdFiles);
				updatedFiles.push('src/trpc/server/api/site/root.ts');
				break;
			case 'components':
				await createComponentsModule(name, basePath, createdFiles);
				break;
			case 'lib':
				await createLibModule(name, basePath, createdFiles);
				break;
			case 'pages':
				await createPagesModule(name, basePath, createdFiles);
				break;
			case 'header-actions':
				await createHeaderActionsModule(name, basePath, project, createdFiles, modules);
				updatedFiles.push('src/components/layouts/main/header/header-actions/registry.ts');
				break;
			case 'modals':
				await createModalsModule(name, basePath, project, createdFiles, modules);
				updatedFiles.push('src/modals/registry.ts');
				break;
		}
	}

	// Save all ts-morph changes
	await project.save();

	if (updatedFiles.length > 0) {
		log.success('Updated registry files');
	}

	// Print summary
	log.step('🚀 Feature creation complete!');
	console.log();
	console.log(chalk.bold('Created files:'));
	createdFiles.forEach((file) => log.dim(file));

	if (updatedFiles.length > 0) {
		console.log();
		console.log(chalk.bold('Updated files:'));
		updatedFiles.forEach((file) => log.dim(file));
	}

	console.log();
	log.info('Next steps:');
	log.dim('1. Run \'npm install\' to install any missing dependencies');
	log.dim('2. Add a route in \'src/routes/\' if this feature needs a URL');
	log.dim('3. Start implementing your feature logic!');
}

async function createApiModule(name, basePath, project, createdFiles) {
	log.info('Creating API module...');

	const apiPath = path.join(basePath, 'api');
	const servicesPath = path.join(apiPath, 'services');

	await mkdir(servicesPath, { recursive: true });

	const indexFile = path.join(apiPath, 'index.ts');
	const routerFile = path.join(apiPath, `${name}.ts`);
	const serviceFile = path.join(servicesPath, `${name}.service.ts`);

	await writeFile(indexFile, getApiIndexTemplate(name));
	await writeFile(routerFile, getApiModuleTemplate(name));
	await writeFile(serviceFile, getApiServiceTemplate(name));

	createdFiles.push(
		`src/features/${name}/api/index.ts`,
		`src/features/${name}/api/${name}.ts`,
		`src/features/${name}/api/services/${name}.service.ts`
	);

	log.success('Created API module');

	// Update tRPC root router
	await updateTrpcRoot(name, project);
}

async function createComponentsModule(name, basePath, createdFiles, minimal = false) {
	log.info('Creating components module...');

	const componentsPath = path.join(basePath, 'components');
	await mkdir(componentsPath, { recursive: true });

	if (!minimal) {
		const componentFile = path.join(componentsPath, `${name}-component.tsx`);
		await writeFile(componentFile, getComponentTemplate(name));
		createdFiles.push(`src/features/${name}/components/${name}-component.tsx`);
		log.success('Created components module');
	} else {
		log.dim('Created components directory (minimal)');
	}
}

async function createLibModule(name, basePath, createdFiles) {
	log.info('Creating lib module...');

	const libPath = path.join(basePath, 'lib');
	const typesPath = path.join(libPath, 'types');
	const validationPath = path.join(libPath, 'validation');

	await mkdir(typesPath, { recursive: true });
	await mkdir(validationPath, { recursive: true });

	const typesFile = path.join(typesPath, 'index.ts');
	const validationFile = path.join(validationPath, `${name}.z.ts`);

	await writeFile(typesFile, getLibTypesTemplate(name));
	await writeFile(validationFile, getLibValidationTemplate(name));

	createdFiles.push(
		`src/features/${name}/lib/types/index.ts`,
		`src/features/${name}/lib/validation/${name}.z.ts`
	);

	log.success('Created lib module');
}

async function createPagesModule(name, basePath, createdFiles) {
	log.info('Creating pages module...');

	const pagesPath = path.join(basePath, 'pages');
	await mkdir(pagesPath, { recursive: true });

	const pageFile = path.join(pagesPath, 'index.tsx');
	await writeFile(pageFile, getPagesIndexTemplate(name));

	createdFiles.push(`src/features/${name}/pages/index.tsx`);

	log.success('Created pages module');
}

async function createHeaderActionsModule(name, basePath, project, createdFiles, modules) {
	log.info('Creating header-actions module...');

	const headerActionsFile = path.join(basePath, 'header-actions.ts');
	const componentPath = path.join(basePath, 'components', `${name}-header-action.tsx`);

	// Ensure components directory exists
	if (!modules.includes('components')) {
		await createComponentsModule(name, basePath, createdFiles, true);
		log.warn('Created components directory for header action component');
	}

	await writeFile(headerActionsFile, getHeaderActionsTemplate(name));
	await writeFile(componentPath, getHeaderActionComponentTemplate(name));

	createdFiles.push(
		`src/features/${name}/header-actions.ts`,
		`src/features/${name}/components/${name}-header-action.tsx`
	);

	log.success('Created header-actions module');

	// Update header actions registry
	await updateHeaderActionsRegistry(name, project);
}

async function createModalsModule(name, basePath, project, createdFiles, modules) {
	log.info('Creating modals module...');

	const modalsFile = path.join(basePath, 'modals.ts');
	const modalsComponentDir = path.join(basePath, 'components', 'modals');
	const modalComponentFile = path.join(modalsComponentDir, `example-${name}-modal.tsx`);

	// Ensure components directory exists
	if (!modules.includes('components')) {
		await createComponentsModule(name, basePath, createdFiles, true);
		log.warn('Created components directory for modal component');
	}

	await mkdir(modalsComponentDir, { recursive: true });
	await writeFile(modalsFile, getModalsTemplate(name));
	await writeFile(modalComponentFile, getModalComponentTemplate(name));

	createdFiles.push(
		`src/features/${name}/modals.ts`,
		`src/features/${name}/components/modals/example-${name}-modal.tsx`
	);

	log.success('Created modals module');

	// Update modals registry
	await updateModalsRegistry(name, project);
}

// --- AST MANIPULATION ---

async function updateTrpcRoot(name, project) {
	log.info('Updating tRPC router registry...');

	const filePath = path.join(PROJECT_ROOT, 'src/trpc/server/api/site/root.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const routerName = `${camelName}FeatureRouter`;

	// Add import statement with object format for namedImports
	sourceFile.addImportDeclaration({
		moduleSpecifier: `@/features/${name}/api`,
		namedImports: [{ name: routerName }],
	});

	// Find the appRouter variable and its initializer
	const appRouter = sourceFile.getVariableDeclaration('appRouter');
	if (!appRouter) {
		throw new Error('Could not find appRouter declaration in root.ts');
	}

	const callExpr = appRouter.getInitializer();
	if (!callExpr) {
		throw new Error('appRouter has no initializer');
	}

	// Get the object literal argument
	const args = callExpr.asKindOrThrow(SyntaxKind.CallExpression).getArguments();
	if (args.length === 0) {
		throw new Error('createTRPCRouter has no arguments');
	}

	const objLiteral = args[0].asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

	// Add the new router to the object
	objLiteral.addPropertyAssignment({
		name: camelName,
		initializer: routerName,
	});

	// Format the file
	sourceFile.formatText();

	log.dim(`Added ${routerName} to appRouter`);
}

async function updateHeaderActionsRegistry(name, project) {
	log.info('Updating header actions registry...');

	const filePath = path.join(PROJECT_ROOT, 'src/components/layouts/main/header/header-actions/registry.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const importAlias = `${camelName}HeaderActions`;

	// Add namespace import
	sourceFile.addImportDeclaration({
		moduleSpecifier: `@/features/${name}/header-actions`,
		namespaceImport: importAlias,
	});

	// Find the headerActionRegistry variable
	const registry = sourceFile.getVariableDeclaration('headerActionRegistry');
	if (!registry) {
		throw new Error('Could not find headerActionRegistry in registry.ts');
	}

	// Get the object literal, handling both direct and 'as const' cases
	let objLiteral;
	const initializer = registry.getInitializer();

	if (initializer?.getKind() === SyntaxKind.AsExpression) {
		// Handle: { ... } as const
		objLiteral = initializer.getExpression();
	} else if (initializer?.getKind() === SyntaxKind.ObjectLiteralExpression) {
		// Handle: { ... }
		objLiteral = initializer;
	} else {
		throw new Error('Expected headerActionRegistry to have an object literal initializer');
	}

	// Insert spread assignment at index 1 (after the first spread, before comments)
	const existingSpreads = objLiteral.getProperties().filter(p => p.getKind() === SyntaxKind.SpreadAssignment);
	const insertIndex = existingSpreads.length > 0 ? existingSpreads.length : 0;

	objLiteral.insertSpreadAssignment(insertIndex, {
		expression: importAlias,
	});

	// Format the file
	sourceFile.formatText();

	log.dim(`Added ${importAlias} to headerActionRegistry`);
}

async function updateModalsRegistry(name, project) {
	log.info('Updating modals registry...');

	const filePath = path.join(PROJECT_ROOT, 'src/modals/registry.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const importAlias = `${camelName}Modals`;

	// Add namespace import
	sourceFile.addImportDeclaration({
		moduleSpecifier: `@/features/${name}/modals`,
		namespaceImport: importAlias,
	});

	// Find the modalRegistry variable
	const registry = sourceFile.getVariableDeclaration('modalRegistry');
	if (!registry) {
		throw new Error('Could not find modalRegistry in registry.ts');
	}

	// Get the object literal, handling both direct and 'as const' cases
	let objLiteral;
	const initializer = registry.getInitializer();

	if (initializer?.getKind() === SyntaxKind.AsExpression) {
		// Handle: { ... } as const
		objLiteral = initializer.getExpression();
	} else if (initializer?.getKind() === SyntaxKind.ObjectLiteralExpression) {
		// Handle: { ... }
		objLiteral = initializer;
	} else {
		throw new Error('Expected modalRegistry to have an object literal initializer');
	}

	// Insert spread assignment at index 1 (after the first spread, before comments)
	const existingSpreads = objLiteral.getProperties().filter(p => p.getKind() === SyntaxKind.SpreadAssignment);
	const insertIndex = existingSpreads.length > 0 ? existingSpreads.length : 0;

	objLiteral.insertSpreadAssignment(insertIndex, {
		expression: importAlias,
	});

	// Format the file
	sourceFile.formatText();

	log.dim(`Added ${importAlias} to modalRegistry`);
}

// --- REMOVAL LOGIC ---

async function removeFeature(name) {
	const basePath = path.join(PROJECT_ROOT, 'src', 'features', name);
	log.step(`Removing feature '${name}'`);

	// Check if feature exists
	let featureExists = false;
	try {
		await access(basePath);
		featureExists = true;
	} catch (e) {
		// Directory does not exist
	}

	// Confirm removal
	const { confirm } = await prompts({
		type: 'confirm',
		name: 'confirm',
		message: featureExists
			? `Remove feature '${name}' from registries and delete directory?`
			: `Feature directory doesn't exist, but remove '${name}' from registries?`,
		initial: false,
	});

	if (!confirm) {
		log.warn('Removal cancelled.');
		process.exit(0);
	}

	// Initialize ts-morph project
	const project = new Project({
		tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
	});

	const updatedFiles = [];

	// Remove from tRPC root router
	try {
		await removeTrpcRouter(name, project);
		updatedFiles.push('src/trpc/server/api/site/root.ts');
	} catch (err) {
		log.warn(`Could not update tRPC router: ${err.message}`);
	}

	// Remove from modals registry
	try {
		await removeModalsRegistry(name, project);
		updatedFiles.push('src/modals/registry.ts');
	} catch (err) {
		log.warn(`Could not update modals registry: ${err.message}`);
	}

	// Remove from header actions registry
	try {
		await removeHeaderActionsRegistry(name, project);
		updatedFiles.push('src/components/layouts/main/header/header-actions/registry.ts');
	} catch (err) {
		log.warn(`Could not update header actions registry: ${err.message}`);
	}

	// Save all changes
	await project.save();

	// Delete feature directory if it exists
	if (featureExists) {
		const { confirmDelete } = await prompts({
			type: 'confirm',
			name: 'confirmDelete',
			message: `Delete feature directory at ${basePath}?`,
			initial: true,
		});

		if (confirmDelete) {
			const { rm } = await import('fs/promises');
			await rm(basePath, { recursive: true, force: true });
			log.success(`Deleted feature directory: ${basePath}`);
		}
	}

	// Print summary
	log.step('🗑️  Feature removal complete!');
	console.log();
	if (updatedFiles.length > 0) {
		console.log(chalk.bold('Updated files:'));
		updatedFiles.forEach((file) => log.dim(file));
	}
	console.log();
}

async function removeTrpcRouter(name, project) {
	const filePath = path.join(PROJECT_ROOT, 'src/trpc/server/api/site/root.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const routerName = `${camelName}FeatureRouter`;

	// Remove import
	const importDecl = sourceFile.getImportDeclaration(
		(decl) => decl.getModuleSpecifierValue() === `@/features/${name}/api`
	);
	if (importDecl) {
		importDecl.remove();
	}

	// Remove from appRouter object
	const appRouter = sourceFile.getVariableDeclaration('appRouter');
	if (appRouter) {
		const callExpr = appRouter.getInitializer();
		if (callExpr) {
			const args = callExpr.asKindOrThrow(SyntaxKind.CallExpression).getArguments();
			if (args.length > 0) {
				const objLiteral = args[0].asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
				const property = objLiteral.getProperty(camelName);
				if (property) {
					property.remove();
				}
			}
		}
	}

	sourceFile.formatText();
	log.success('Removed from tRPC router');
}

async function removeModalsRegistry(name, project) {
	const filePath = path.join(PROJECT_ROOT, 'src/modals/registry.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const importAlias = `${camelName}Modals`;

	// Remove import
	const importDecl = sourceFile.getImportDeclaration(
		(decl) => decl.getModuleSpecifierValue() === `@/features/${name}/modals`
	);
	if (importDecl) {
		importDecl.remove();
	}

	// Remove from modalRegistry object
	const registry = sourceFile.getVariableDeclaration('modalRegistry');
	if (registry) {
		let objLiteral;
		const initializer = registry.getInitializer();

		if (initializer?.getKind() === SyntaxKind.AsExpression) {
			objLiteral = initializer.getExpression();
		} else if (initializer?.getKind() === SyntaxKind.ObjectLiteralExpression) {
			objLiteral = initializer;
		}

		if (objLiteral) {
			const spreadProp = objLiteral.getProperties().find(
				(p) => p.getKind() === SyntaxKind.SpreadAssignment &&
					p.getText().includes(importAlias)
			);
			if (spreadProp) {
				spreadProp.remove();
			}
		}
	}

	sourceFile.formatText();
	log.success('Removed from modals registry');
}

async function removeHeaderActionsRegistry(name, project) {
	const filePath = path.join(PROJECT_ROOT, 'src/components/layouts/main/header/header-actions/registry.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const importAlias = `${camelName}HeaderActions`;

	// Remove import
	const importDecl = sourceFile.getImportDeclaration(
		(decl) => decl.getModuleSpecifierValue() === `@/features/${name}/header-actions`
	);
	if (importDecl) {
		importDecl.remove();
	}

	// Remove from headerActionRegistry object
	const registry = sourceFile.getVariableDeclaration('headerActionRegistry');
	if (registry) {
		let objLiteral;
		const initializer = registry.getInitializer();

		if (initializer?.getKind() === SyntaxKind.AsExpression) {
			objLiteral = initializer.getExpression();
		} else if (initializer?.getKind() === SyntaxKind.ObjectLiteralExpression) {
			objLiteral = initializer;
		}

		if (objLiteral) {
			const spreadProp = objLiteral.getProperties().find(
				(p) => p.getKind() === SyntaxKind.SpreadAssignment &&
					p.getText().includes(importAlias)
			);
			if (spreadProp) {
				spreadProp.remove();
			}
		}
	}

	sourceFile.formatText();
	log.success('Removed from header actions registry');
}

// --- MAIN EXECUTION ---

async function main() {
	console.log(chalk.bold.cyan('\n🎨 Feature Scaffolding Tool\n'));

	const args = minimist(process.argv.slice(2), {
		string: ['name', 'feature-name', 'remove'],
		boolean: ['help'],
		alias: { n: 'name', f: 'feature-name', r: 'remove', h: 'help' }
	});

	// Show help
	if (args.help) {
		console.log(chalk.bold('Usage:'));
		console.log('  npm run create                              # Interactive mode');
		console.log('  npm run create -- my-feature                # Create with positional arg');
		console.log('  npm run create -- --name=my-feature         # Create with --name flag');
		console.log('  npm run create -- --remove my-feature       # Remove a feature');
		console.log('  npm run create -- -r my-feature             # Remove a feature (short)');
		console.log();
		console.log(chalk.bold('Options:'));
		console.log('  -n, --name          Feature name (kebab-case)');
		console.log('  -r, --remove        Remove a feature and its registry entries');
		console.log('  -h, --help          Show this help message');
		console.log();
		process.exit(0);
	}

	// Handle removal mode
	const removeArg = args.remove ?? args.r;
	if (removeArg !== undefined) {
		const featureName =
			typeof removeArg === 'string'
				? removeArg
				: (args._ && typeof args._[0] === 'string' ? args._[0] : undefined);

		if (!featureName) {
			log.error('Feature name is required for removal. Usage: npm run create -- --remove <feature-name>');
			process.exit(1);
		}

		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featureName)) {
			log.error('Feature name must be in kebab-case (e.g., my-feature, user-profile)');
			process.exit(1);
		}

		await removeFeature(featureName);
		return;
	}

	// Support multiple argument formats for creation:
	// 1. --name=my-feature or --name my-feature
	// 2. --feature-name=my-feature or -f my-feature
	// 3. Positional: npm run create -- my-feature
	let featureName = args.name || args['feature-name'] || args._[0];

	// Prompt for feature name if not provided
	if (!featureName) {
		const response = await prompts({
			type: 'text',
			name: 'name',
			message: 'Enter the name for the new feature (kebab-case):',
			validate: (value) => {
				if (!value) {
					return 'Feature name is required';
				}
				if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
					return 'Name must be in kebab-case (e.g., my-feature, user-profile)';
				}
				return true;
			},
		});

		if (!response.name) {
			log.error('Feature name is required. Aborting.');
			process.exit(1);
		}

		featureName = response.name;
	}

	// Validate feature name format
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featureName)) {
		log.error('Feature name must be in kebab-case (e.g., my-feature, user-profile)');
		process.exit(1);
	}

	// Prompt for module selection
	const { modules } = await prompts({
		type: 'multiselect',
		name: 'modules',
		message: 'Select the modules to create for this feature:',
		choices: [
			{
				title: 'API (tRPC routes and services)',
				value: 'api',
				selected: true,
			},
			{
				title: 'Components (React components)',
				value: 'components',
				selected: true,
			},
			{
				title: 'Lib (types and validation)',
				value: 'lib',
				selected: true,
			},
			{
				title: 'Pages (reusable page sections)',
				value: 'pages',
				selected: true,
			},
			{
				title: 'Header Actions (dynamic header content)',
				value: 'header-actions',
				selected: false,
			},
			{
				title: 'Modals (dialogs/drawers)',
				value: 'modals',
				selected: false,
			},
		],
		hint: '- Space to select. Return to submit',
		min: 1,
	});

	if (!modules || modules.length === 0) {
		log.warn('No modules selected. Aborting.');
		process.exit(0);
	}

	// Create the feature
	await createFeature(featureName, modules);
}

// Run the script
main().catch((err) => {
	log.error('An unexpected error occurred:');
	console.error(err);
	process.exit(1);
});
